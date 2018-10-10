import { Claim, isValidClaim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { pipeP } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { ErrorCodes } from 'Helpers/MongoDB'
import { minutesToMiliseconds } from 'Helpers/Time'
import { ClaimIdIPFSHashPair } from 'Interfaces'
import { Messaging } from 'Messaging/Messaging'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { FailureReason, FailureType } from './DownloadFailure'
import { Entry } from './Entry'
import {
  NoMoreEntriesException,
  InvalidClaim,
  IPFSGenericError,
  IPFSTimeoutError,
  errorToIPFSError,
} from './Exceptions'
import { IPFS } from './IPFS'

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly ipfs: IPFS
  private readonly configuration: ClaimControllerConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('IPFS') ipfs: IPFS,
    @inject('ClaimControllerConfiguration') configuration: ClaimControllerConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('storageReader')
    this.configuration = configuration
    this.messaging = messaging
    this.ipfs = ipfs
  }

  async download(ipfsFileHashes: ReadonlyArray<string>) {
    const logger = this.logger.child({ method: 'download' })

    logger.trace({ ipfsFileHashes }, 'Downloading Claims')

    try {
      await this.collection.insertMany(
        ipfsFileHashes.map(ipfsFileHash => ({
          ipfsFileHash,
          claimId: null,
          lastDownloadAttemptTime: null,
          downloadSuccessTime: null,
          downloadAttempts: 0,
        })),
        { ordered: false }
      )
    } catch (exception) {
      if (exception.code !== ErrorCodes.DuplicateKey) throw exception
      logger.trace({ exception }, 'Duplicate IPFS hash')
    }
  }

  async downloadNextHash({
    retryDelay = minutesToMiliseconds(this.configuration.downloadRetryDelayInMinutes),
    maxAttempts = this.configuration.downloadMaxAttempts,
  }: {
    retryDelay?: number
    maxAttempts?: number
  } = {}): Promise<void> {
    const logger = this.logger.child({ method: 'downloadNextHash' })

    const updateEntryFailureReason = (ipfsFileHash: string, failureType: FailureType, failureReason: FailureReason) =>
      this.collection.updateOne(
        { ipfsFileHash },
        {
          $set: {
            failureType,
            failureReason,
          },
        }
      )

    const publishEntryFailureReason = async (
      ipfsFileHash: string,
      failureType: FailureType,
      failureReason: FailureReason,
      failureTime: number
    ) => {
      const logger = this.logger.child({ method: 'publishEntryFailureReason' })
      logger.trace('started publishing')

      await this.messaging.publishClaimsNotDownloaded([
        {
          ipfsFileHash,
          failureType,
          failureReason,
          failureTime,
        },
      ])
      logger.trace('finished publishing')
    }

    const pipe = pipeP(
      this.findEntryToDownload,
      this.updateEntryAttempts,
      this.downloadEntryClaim,
      this.setEntryDownloadSuccessTime,
      this.updateEntryPairs,
      this.publishEntryDownload
    )

    const handleErrors = async (error: Error) => {
      if (error instanceof NoMoreEntriesException) logger.trace(error.message)
      else if (error instanceof InvalidClaim) {
        await updateEntryFailureReason(error.ipfsFileHash, FailureType.Hard, error.failureReason)
        await publishEntryFailureReason(error.ipfsFileHash, FailureType.Hard, error.failureReason, error.failureTime)
      } else if (error instanceof IPFSTimeoutError) {
        await updateEntryFailureReason(error.ipfsFileHash, FailureType.Soft, FailureReason.IPFSTimeout)
        await publishEntryFailureReason(
          error.ipfsFileHash,
          FailureType.Soft,
          FailureReason.IPFSTimeout,
          error.failureTime
        )
      } else if (error instanceof IPFSGenericError) {
        logger.warn({ error })
        await updateEntryFailureReason(error.ipfsFileHash, FailureType.Soft, FailureReason.IPFSGeneric)
        await publishEntryFailureReason(
          error.ipfsFileHash,
          FailureType.Soft,
          FailureReason.IPFSGeneric,
          error.failureTime
        )
      } else throw error
    }

    const logSuccess = (x: { claim: Claim; entry: Entry }) => {
      logger.trace(x, 'Successfully downloaded entry')
      logger.info({ claimId: x.claim.id }, 'Successfully downloaded entry')
      return x
    }

    logger.trace('Downloading next entry')
    await pipe({ retryDelay, maxAttempts })
      .then(logSuccess)
      .catch(handleErrors)
  }

  private findEntryToDownload = async ({
    currentTime = new Date().getTime(),
    retryDelay,
    maxAttempts,
    ...rest
  }: {
    currentTime?: number
    retryDelay: number
    maxAttempts: number
  }) => {
    const logger = this.logger.child({ method: 'findEntryToDownload' })
    logger.trace('started finding entry')
    const entry = await this.collection.findOne({
      claimId: null,
      ipfsFileHash: { $exists: true },
      $and: [
        {
          $or: [
            { lastDownloadAttemptTime: null },
            { lastDownloadAttemptTime: { $exists: false } },
            { lastDownloadAttemptTime: { $lt: currentTime - retryDelay } },
          ],
        },
        {
          $or: [{ downloadSuccessTime: null }, { downloadSuccessTime: { $exists: false } }],
        },
        {
          $or: [
            { downloadAttempts: null },
            { downloadAttempts: { $exists: false } },
            { downloadAttempts: { $lte: maxAttempts } },
          ],
        },
        {
          $or: [{ failureType: null }, { failureType: { $exists: false } }, { failureType: { $ne: FailureType.Hard } }],
        },
      ],
    })

    if (!entry) throw new NoMoreEntriesException('No valid entries found')

    logger.trace({ entry }, 'finished finding entry')

    return {
      currentTime,
      retryDelay,
      maxAttempts,
      entry,
      ...rest,
    }
  }

  private updateEntryAttempts = async ({
    entry,
    currentTime = new Date().getTime(),
    ...rest
  }: {
    entry: Entry
    currentTime?: number
  }) => {
    const logger = this.logger.child({ method: 'updateEntryAttempts' })
    logger.trace({ entry }, 'started updating entry')

    await this.collection.updateOne(
      {
        _id: entry._id,
      },
      {
        $set: { lastDownloadAttemptTime: currentTime },
        $inc: { downloadAttempts: 1 },
      }
    )

    logger.trace('finished updating entry')

    return {
      entry,
      currentTime,
      ...rest,
    }
  }

  private downloadEntryClaim = async ({ entry, ...rest }: { entry: Entry }) => {
    const { ipfsFileHash } = entry
    const downloadClaim = (ipfsFileHash: string) => this.ipfs.cat(ipfsFileHash).rethrow(errorToIPFSError(ipfsFileHash))

    const parseClaim = (ipfsFileHash: string, serialized: string) => {
      try {
        return JSON.parse(serialized)
      } catch (error) {
        throw new InvalidClaim(ipfsFileHash, FailureReason.InvalidJson, new Date().getTime())
      }
    }
    const logger = this.logger.child({ method: 'downloadEntryClaim' })

    logger.trace({ ipfsFileHash }, 'Starting claim download')

    const serialized = await downloadClaim(ipfsFileHash)
    const claim = parseClaim(ipfsFileHash, serialized)

    if (!isValidClaim(claim)) throw new InvalidClaim(ipfsFileHash, FailureReason.InvalidClaim, new Date().getTime())

    logger.trace({ ipfsFileHash, claim }, 'Finished claim download')
    return {
      entry,
      claim,
      ...rest,
    }
  }

  private setEntryDownloadSuccessTimeById = (entryId: string, downloadSuccessTime: number) =>
    this.collection.updateOne(
      {
        _id: entryId,
      },
      { $set: { downloadSuccessTime } }
    )

  private setEntryDownloadSuccessTime = async ({ entry, ...rest }: { entry: Entry }) => {
    const logger = this.logger.child({ method: 'setEntryDownloadSuccessTime' })
    logger.trace('setting download success time')

    await this.setEntryDownloadSuccessTimeById(entry._id, new Date().getTime())

    logger.trace('finished setting download success time')

    return {
      entry,
      ...rest,
    }
  }

  private updateEntryPairs = async ({ entry, claim, ...rest }: { claim: Claim; entry: Entry }) => {
    const logger = this.logger.child({ method: 'updateEntryPairs' })
    logger.trace('started updating hash pairs')

    await this.updateClaimIdIPFSHashPairs([
      {
        claimId: claim.id,
        ipfsFileHash: entry.ipfsFileHash,
      },
    ])

    logger.trace('finished updating hash pairs')

    return {
      claim,
      entry,
      ...rest,
    }
  }

  private publishEntryDownload = async ({ entry, claim, ...rest }: { claim: Claim; entry: Entry }) => {
    const logger = this.logger.child({ method: 'publishEntryDownload' })
    logger.trace('started publishing')

    await this.messaging.publishClaimsDownloaded([
      {
        claim,
        ipfsFileHash: entry.ipfsFileHash,
      },
    ])

    logger.trace('finished publishing')

    return {
      claim,
      entry,
      ...rest,
    }
  }

  private async updateClaimIdIPFSHashPairs(claimIdIPFSHashPairs: ReadonlyArray<ClaimIdIPFSHashPair>) {
    const logger = this.logger.child({ method: 'updateClaimIdIPFSHashPairs' })

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsFileHash } pairs in the DB.')

    const results = await Promise.all(
      claimIdIPFSHashPairs.map(({ claimId, ipfsFileHash }) =>
        this.collection.updateOne({ ipfsFileHash }, { $set: { claimId } }, { upsert: true })
      )
    )

    const databaseErrors = results.filter(_ => _.result.n !== 1)

    if (databaseErrors.length)
      logger.error({ databaseErrors }, 'Error storing { claimId, ipfsFileHash } pairs in the DB.')

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsFileHash } pairs in the DB successfully.')
  }
}

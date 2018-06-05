import { Claim, isValidClaim, ClaimIdIPFSHashPair } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { asyncPipe } from 'Helpers/AsyncPipe'
import { NoMoreEntriesException } from 'Helpers/Exceptions'
import { childWithFileName } from 'Helpers/Logging'
import { minutesToMiliseconds } from 'Helpers/Time'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { Entry } from './Entry'
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
    this.collection = this.db.collection('storage')
    this.configuration = configuration
    this.messaging = messaging
    this.ipfs = ipfs
  }

  async create(claim: Claim): Promise<void> {
    const logger = this.logger.child({ method: 'create' })

    logger.trace({ claim }, 'Storing Claim')

    const ipfsHash = await this.ipfs.addText(JSON.stringify(claim))

    logger.info({ claim, ipfsHash }, 'Claim Stored')

    await this.collection.insertOne({
      claimId: claim.id,
      ipfsHash,
    })
    await this.messaging.publish(Exchange.ClaimIPFSHash, {
      claimId: claim.id,
      ipfsHash,
    })
  }

  async download(ipfsHashes: ReadonlyArray<string>) {
    const logger = this.logger.child({ method: 'download' })

    logger.trace({ ipfsHashes }, 'Downloading Claims')
    await this.collection.insertMany(
      ipfsHashes.map(ipfsHash => ({
        ipfsHash,
        claimId: null,
        lastDownloadAttemptTime: null,
        downloadSuccessTime: null,
        downloadAttempts: 0,
      })),
      { ordered: false }
    )
  }

  async downloadNextHash({
    retryDelay = minutesToMiliseconds(this.configuration.downloadRetryDelayInMinutes),
    maxAttempts = this.configuration.downloadMaxAttempts,
  }: {
    retryDelay?: number
    maxAttempts?: number
  } = {}) {
    this.logger.child({ method: 'downloadNextHash' })
    try {
      this.logger.trace('Downloading next entry')
      const result = await asyncPipe(
        this.findEntryToDownload,
        this.updateEntryAttempts,
        this.downloadEntryClaim,
        this.updateEntryPairs,
        this.publishEntryDownload
      )({ retryDelay, maxAttempts })
      this.logger.info('Successfully downloaded entry')
      return result
    } catch (error) {
      if (error instanceof NoMoreEntriesException) return this.logger.trace(error.message)
      this.logger.error(error)
    }
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
      ipfsHash: { $exists: true },
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
      ],
    })

    if (!entry) throw new NoMoreEntriesException('No valid entries found')

    logger.trace('finished finding entry', entry)

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
    logger.trace('started updating entry')

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
    const logger = this.logger.child({ method: 'downloadEntryClaim' })
    logger.trace('starting claim download')
    const claim = await this.downloadClaim(entry.ipfsHash)
    logger.trace('finished claim download', claim)
    return {
      entry,
      claim,
      ...rest,
    }
  }

  private updateEntryPairs = async ({ entry, claim, ...rest }: { claim: Claim; entry: Entry }) => {
    const logger = this.logger.child({ method: 'updateEntryPairs' })
    logger.trace('started updating hash pairs')

    await this.updateClaimIdIPFSHashPairs([
      {
        claimId: claim.id,
        ipfsHash: entry.ipfsHash,
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
        ipfsHash: entry.ipfsHash,
      },
    ])

    logger.trace('finished publishing')

    return {
      claim,
      entry,
      ...rest,
    }
  }

  private downloadClaim = async (ipfsHash: string): Promise<Claim> => {
    const text = await this.ipfs.cat(ipfsHash)
    const claim = JSON.parse(text)

    if (!isValidClaim(claim)) throw new Error('Unrecognized claim')

    return claim
  }

  private async updateClaimIdIPFSHashPairs(claimIdIPFSHashPairs: ReadonlyArray<ClaimIdIPFSHashPair>) {
    const logger = this.logger.child({ method: 'updateClaimIdIPFSHashPairs' })

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsHash } pairs in the DB.')

    const results = await Promise.all(
      claimIdIPFSHashPairs.map(({ claimId, ipfsHash }) =>
        this.collection.updateOne({ ipfsHash }, { $set: { claimId } }, { upsert: true })
      )
    )

    const databaseErrors = results.filter(_ => _.result.n !== 1)

    if (databaseErrors.length) logger.error({ databaseErrors }, 'Error storing { claimId, ipfsHash } pairs in the DB.')

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsHash } pairs in the DB successfully.')
  }
}

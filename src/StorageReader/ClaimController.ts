  /* tslint:disable:trailing-comma */
import { SignedVerifiableClaim, VerifiableClaimSigner } from '@po.et/poet-js'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { pipeP } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { ErrorCodes } from 'Helpers/MongoDB'
import { minutesToMiliseconds } from 'Helpers/Time'
import { ClaimIdIPFSHashPair } from 'Interfaces'
import { Messaging } from 'Messaging/Messaging'

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

export interface ClaimControllerConfiguration {
  readonly downloadRetryDelayInMinutes: number
  readonly downloadMaxAttempts: number
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
  readonly messaging: Messaging
  readonly ipfs: IPFS
  readonly verifiableClaimSigner: VerifiableClaimSigner
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: ClaimControllerConfiguration
}

export interface ClaimController {
  readonly download: (ipfsFileHashes: ReadonlyArray<string>) => Promise<void>
  readonly downloadNextHash: (options?: { retryDelay?: number, maxAttempts?: number }) => Promise<void>
}

export const ClaimController = ({
  dependencies: {
    logger,
    db,
    messaging,
    ipfs,
    verifiableClaimSigner,
  },
  configuration,
}: Arguments): ClaimController => {
  const claimControllerLogger = childWithFileName(logger, __filename)
  const collection = db.collection('storageReader')

  const download = async (ipfsFileHashes: ReadonlyArray<string>) => {
    const logger = claimControllerLogger.child({ method: 'download' })

    logger.trace({ ipfsFileHashes }, 'Downloading Claims')

    try {
      await collection.insertMany(
        ipfsFileHashes.map(ipfsFileHash => ({
          ipfsFileHash,
          claimId: null,
          lastDownloadAttemptTime: null,
          downloadSuccessTime: null,
          downloadAttempts: 0,
        })),
        { ordered: false },
      )
    } catch (exception) {
      if (exception.code !== ErrorCodes.DuplicateKey) throw exception
      logger.trace({ exception }, 'Duplicate IPFS hash')
    }
  }

  const downloadNextHash = async ({
    retryDelay = minutesToMiliseconds(configuration.downloadRetryDelayInMinutes),
    maxAttempts = configuration.downloadMaxAttempts,
  }: {
    retryDelay?: number
    maxAttempts?: number,
  } = {}): Promise<void> => {
    const logger = claimControllerLogger.child({ method: 'downloadNextHash' })

    const updateEntryFailureReason = (ipfsFileHash: string, failureType: FailureType, failureReason: FailureReason) =>
      collection.updateOne(
        { ipfsFileHash },
        {
          $set: {
            failureType,
            failureReason,
          },
        },
      )

    const publishEntryFailureReason = async (
      ipfsFileHash: string,
      failureType: FailureType,
      failureReason: FailureReason,
      failureTime: number
    ) => {
      const logger = claimControllerLogger.child({ method: 'publishEntryFailureReason' })
      logger.trace('started publishing')

      await messaging.publishClaimsNotDownloaded([
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
      findEntryToDownload,
      updateEntryAttempts,
      downloadEntryClaim,
      setEntryDownloadSuccessTime,
      updateEntryPairs,
      publishEntryDownload,
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

    const logSuccess = (x: { claim: SignedVerifiableClaim; entry: Entry }) => {
      logger.trace(x, 'Successfully downloaded entry')
      logger.info({ claimId: x.claim.id }, 'Successfully downloaded entry')
      return x
    }

    logger.trace('Downloading next entry')
    await pipe({ retryDelay, maxAttempts })
      .then(logSuccess)
      .catch(handleErrors)
  }

  const findEntryToDownload = async ({
    currentTime = new Date().getTime(),
    retryDelay,
    maxAttempts,
    ...rest
  }: {
    currentTime?: number
    retryDelay: number
    maxAttempts: number,
  }) => {
    const logger = claimControllerLogger.child({ method: 'findEntryToDownload' })
    logger.trace('started finding entry')
    const entry = await collection.findOne({
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

  const updateEntryAttempts = async ({
    entry,
    currentTime = new Date().getTime(),
    ...rest
  }: {
    entry: Entry
    currentTime?: number,
  }) => {
    const logger = claimControllerLogger.child({ method: 'updateEntryAttempts' })
    logger.trace({ entry }, 'started updating entry')

    await collection.updateOne(
      {
        _id: entry._id,
      },
      {
        $set: { lastDownloadAttemptTime: currentTime },
        $inc: { downloadAttempts: 1 },
      },
    )

    logger.trace('finished updating entry')

    return {
      entry,
      currentTime,
      ...rest,
    }
  }

  const downloadEntryClaim = async ({ entry, ...rest }: { entry: Entry }) => {
    const { ipfsFileHash } = entry
    const downloadClaim = (ipfsFileHash: string) => ipfs.cat(ipfsFileHash).rethrow(errorToIPFSError(ipfsFileHash))
    const parseClaim = (ipfsFileHash: string, serialized: string) => {
      try {
        return JSON.parse(serialized)
      } catch (error) {
        throw new InvalidClaim(ipfsFileHash, FailureReason.InvalidJson)
      }
    }
    const logger = claimControllerLogger.child({ method: 'downloadEntryClaim' })

    logger.trace({ ipfsFileHash }, 'Starting claim download')

    const serialized = await downloadClaim(ipfsFileHash)
    const claim = parseClaim(ipfsFileHash, serialized)

    if (!(await verifiableClaimSigner.isValidSignedVerifiableClaim(claim)))
      throw new InvalidClaim(ipfsFileHash, FailureReason.InvalidSignedVerifiableClaim)

    logger.trace({ ipfsFileHash, claim }, 'Finished claim download')

    return {
      entry,
      claim,
      ...rest,
    }
  }

  const setEntryDownloadSuccessTimeById = (entryId: string, downloadSuccessTime: number) =>
    collection.updateOne(
      {
        _id: entryId,
      },
      { $set: { downloadSuccessTime } },
    )

  const setEntryDownloadSuccessTime = async ({ entry, ...rest }: { entry: Entry }) => {
    const logger = claimControllerLogger.child({ method: 'setEntryDownloadSuccessTime' })
    logger.trace('setting download success time')

    await setEntryDownloadSuccessTimeById(entry._id, new Date().getTime())

    logger.trace('finished setting download success time')

    return {
      entry,
      ...rest,
    }
  }

  const updateEntryPairs = async ({ entry, claim, ...rest }: { claim: SignedVerifiableClaim; entry: Entry }) => {
    const logger = claimControllerLogger.child({ method: 'updateEntryPairs' })
    logger.trace('started updating hash pairs')

    await updateClaimIdIPFSHashPairs([
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

  const publishEntryDownload = async ({ entry, claim, ...rest }: { claim: SignedVerifiableClaim; entry: Entry }) => {
    const logger = claimControllerLogger.child({ method: 'publishEntryDownload' })
    logger.trace('started publishing')

    await messaging.publishClaimsDownloaded([
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

  const updateClaimIdIPFSHashPairs = async (claimIdIPFSHashPairs: ReadonlyArray<ClaimIdIPFSHashPair>) => {
    const logger = claimControllerLogger.child({ method: 'updateClaimIdIPFSHashPairs' })

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsFileHash } pairs in the DB.')

    const results = await Promise.all(
      claimIdIPFSHashPairs.map(({ claimId, ipfsFileHash }) =>
        collection.updateOne({ ipfsFileHash }, { $set: { claimId } }, { upsert: true }),
      ),
    )

    const databaseErrors = results.filter(_ => _.result.n !== 1)

    if (databaseErrors.length)
      logger.error({ databaseErrors }, 'Error storing { claimId, ipfsFileHash } pairs in the DB.')

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsFileHash } pairs in the DB successfully.')
  }

  return {
    download,
    downloadNextHash
  }
}

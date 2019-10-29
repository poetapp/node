import { Work, PoetBlockAnchor, SignedVerifiableClaim } from '@po.et/poet-js'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export interface Controller {
  readonly createDbIndices: () => Promise<void>
  readonly insertClaimIdIPFSFileHashPair: (claimId: string, ipfsFileHash: string) => Promise<void>
  readonly setDirectoryHashOnEntries: (data: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => Promise<void>
  readonly setTxId: (ipfsDirectoryHash: string, transactionId: string) => Promise<void>
  readonly upsertAnchors: (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => Promise<void>
  readonly setFileHashesForDirectoryHash: (data: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => Promise<void>
  readonly upsertClaimIPFSHashPair: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => Promise<void>
}

export const Controller = ({
  dependencies: {
    logger,
    db,
  },
}: Arguments): Controller => {
  const controllerLogger: Pino.Logger = childWithFileName(logger, __filename)
  const anchorCollection: Collection = db.collection('anchors')
  const workCollection: Collection = db.collection('works')

  const createDbIndices = async () => {

  }

  const insertClaimIdIPFSFileHashPair = async (claimId: string, ipfsFileHash: string): Promise<void> => {
    await workCollection.insertOne({ claimId, ipfsFileHash })
  }

  const setDirectoryHashOnEntries = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    const logger = controllerLogger.child({ method: 'setDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')
    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        workCollection.updateOne(
          { 'anchor.ipfsFileHash': ipfsFileHash },
          { $set: { 'anchor.ipfsDirectoryHash': ipfsDirectoryHash } },
          { upsert: true },
        ),
      ),
    )
  }

  const setTxId = async (ipfsDirectoryHash: string, transactionId: string): Promise<void> => {
    const logger = controllerLogger.child({ method: 'setTxId' })
    logger.trace({ ipfsDirectoryHash, transactionId }, 'Setting the Transaction ID for a IPFS Hash')
    await workCollection.updateMany(
      { 'anchor.ipfsDirectoryHash': ipfsDirectoryHash },
      { $set: { 'anchor.transactionId': transactionId } },
    )
  }

  const upsertAnchors =  async (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    const logger = controllerLogger.child({ method: 'upsertAnchors' })
    logger.trace({ poetAnchors }, 'Upserting Po.et Anchors')

    await Promise.all(
      poetAnchors.map(anchor =>
        anchorCollection.updateOne(
          { ipfsDirectoryHash: anchor.ipfsDirectoryHash },
          { $set: anchor },
          { upsert: true },
        ),
      ),
    )
  }

  const setFileHashesForDirectoryHash = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    const logger = controllerLogger.child({ method: 'setFileHashesForDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')
    const anchor = await anchorCollection.findOne({ ipfsDirectoryHash }, { projection: { _id: 0 } })
    logger.debug({ ipfsFileHashes, ipfsDirectoryHash, anchor }, 'setting directory hash on work entries')

    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        workCollection.updateOne(
          { 'anchor.ipfsFileHash': ipfsFileHash },
          { $set: { anchor: { ...anchor, ipfsFileHash } } },
          { upsert: true },
        ),
      ),
    )
  }

  const upsertClaimIPFSHashPair = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = controllerLogger.child({ method: 'upsertClaimIPFSHashPair' })
    logger.debug({ claimIPFSHashPairs }, 'Upserting Claims by IPFS Hash')
    await Promise.all(
      claimIPFSHashPairs.map(({ claim, ipfsFileHash }) =>
        workCollection.updateOne({ 'anchor.ipfsFileHash': ipfsFileHash }, { $set: claim }, { upsert: true }),
      ),
    )
  }

  return {
    createDbIndices,
    insertClaimIdIPFSFileHashPair,
    setDirectoryHashOnEntries,
    setTxId,
    upsertAnchors,
    setFileHashesForDirectoryHash,
    upsertClaimIPFSHashPair,
  }
}

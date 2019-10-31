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
  readonly setDirectoryHash: (data: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => Promise<void>
  readonly setAnchors: (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => Promise<void>
  readonly verifyIPFSDirectoryHashes: (data: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => Promise<void>
  readonly verifyIPFSFileHashes: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => Promise<void>
  readonly uploadNextAnchorReceipt: () => Promise<void>
}

export const Controller = ({
  dependencies: {
    logger,
    db,
  },
}: Arguments): Controller => {
  const controllerLogger: Pino.Logger = childWithFileName(logger, __filename)
  const claimAnchorReceiptsCollection: Collection = db.collection('claimAnchorReceipts')

  const createDbIndices = async () => {
    await claimAnchorReceiptsCollection.createIndex(
      { claimId: 1, ipfsFileHash: 1, ipfsDirectoryHash: 1 },
      { unique: true },
    )
  }

  const insertClaimIdIPFSFileHashPair = async (claimId: string, ipfsFileHash: string): Promise<void> => {
    await claimAnchorReceiptsCollection.insertOne({ claimId, ipfsFileHash })
  }

  const setDirectoryHash = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    const logger = controllerLogger.child({ method: 'setDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash for file hashes')
    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsFileHash },
          { $set: { ipfsDirectoryHash } },
        ),
      ),
    )
  }

  const setAnchors =  async (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    const logger = controllerLogger.child({ method: 'setAnchors' })
    logger.trace({ poetAnchors }, 'Setting Po.et Anchors')

    await Promise.all(
      poetAnchors.map(anchor =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsDirectoryHash: anchor.ipfsDirectoryHash },
          { $set: anchor },
        ),
      ),
    )
  }

  const verifyIPFSDirectoryHashes = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    const logger = controllerLogger.child({ method: 'setFileHashesForDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')

    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsFileHash, ipfsDirectoryHash },
          { $set: { ipfsDirectoryHashVerified: true } },
        ),
      ),
    )
    // TODO: do something for files that don't match the expected directory
  }

  const verifyIPFSFileHashes = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = controllerLogger.child({ method: 'verifyIPFSFileHashes' })
    logger.debug({ claimIPFSHashPairs }, 'Upserting Claims by IPFS Hash')
    await Promise.all(
      claimIPFSHashPairs.map(({ claim, ipfsFileHash }) =>
        claimAnchorReceiptsCollection.updateOne(
          { claimId: claim.id, ipfsFileHash },
          { $set: { ipfsFileHashVerified: true } },
        ),
      ),
    )
    // TODO: do something for claims that don't match the expected file
  }

  const uploadNextAnchorReceipt = async () => {
    const logger = controllerLogger.child({ method: 'uploadNextAnchorReceipt' })
    const anchorReceipt = await claimAnchorReceiptsCollection.findOne({
      ipfsFileHashVerified: true,
      ipfsDirectoryHashVerified: true,
      anchorReceiptFileHash: null,
    })
    logger.debug({ anchorReceipt })
  }

  return {
    createDbIndices,
    insertClaimIdIPFSFileHashPair,
    setDirectoryHash,
    setAnchors,
    verifyIPFSDirectoryHashes,
    verifyIPFSFileHashes,
    uploadNextAnchorReceipt,
  }
}

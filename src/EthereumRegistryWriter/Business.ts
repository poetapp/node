import { PoetBlockAnchor } from '@po.et/poet-js'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { EthereumRegistryContract } from 'Helpers/EthereumRegistryContract'
import { IPFS } from 'Helpers/IPFS'
import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
  readonly ipfs: IPFS
  readonly ethereumRegistryContract: EthereumRegistryContract
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export interface Business {
  readonly createDbIndices: () => Promise<void>
  readonly insertClaimIdIPFSFileHashPair: (claimId: string, ipfsFileHash: string) => Promise<void>
  readonly setDirectoryHash: (data: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => Promise<void>
  readonly setAnchors: (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => Promise<void>
  readonly confirmBatchDirectory: (ipfsFileHashes: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly verifyIPFSFileHashes: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => Promise<void>
  readonly uploadNextAnchorReceipt: () => Promise<void>
  readonly registerNextDirectory: () => Promise<void>
}

export const Business = ({
  dependencies: {
    logger,
    db,
    ipfs,
    ethereumRegistryContract,
  },
}: Arguments): Business => {
  const businessLogger: Pino.Logger = childWithFileName(logger, __filename)
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
    const logger = businessLogger.child({ method: 'setDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash for file hashes')
    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsFileHash },
          { $set: { ipfsDirectoryHash } },
        ),
      ),
    )
    logger.info({ ipfsDirectoryHash, ipfsFileHashes }, 'IPFS Directory Hash set successfully')
  }

  const setAnchors =  async (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    const logger = businessLogger.child({ method: 'setAnchors' })
    logger.info({ poetAnchors }, 'Setting Po.et Anchors')

    await Promise.all(
      poetAnchors.map(anchor =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsDirectoryHash: anchor.ipfsDirectoryHash },
          { $set: anchor },
        ),
      ),
    )
  }

  const confirmBatchDirectory = async (
    ipfsFileHashes: ReadonlyArray<string>,
    ipfsDirectoryHash: string,
  ) => {
    const logger = businessLogger.child({ method: 'setFileHashesForDirectoryHash' })
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
    const logger = businessLogger.child({ method: 'verifyIPFSFileHashes' })
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
    const logger = businessLogger.child({ method: 'uploadNextAnchorReceipt' })
    const entry = await claimAnchorReceiptsCollection.findOne({
      ipfsFileHashVerified: true,
      ipfsDirectoryHashVerified: true,
      anchorReceiptFileHash: null,
    })
    if (!entry) {
      logger.trace('No more anchor receipts to upload to IPFS')
      return
    }
    logger.debug({ entry })
    const { _id, ipfsDirectoryHashVerified, ipfsFileHashVerified, ...anchorReceipt } = entry
    const anchorReceiptFileHash = await ipfs.addText()(JSON.stringify(anchorReceipt))
    logger.debug({ anchorReceipt, anchorReceiptFileHash })
    await claimAnchorReceiptsCollection.updateOne({ _id }, { $set: { anchorReceiptFileHash } })
    const ipfsDirectoryHash = await ipfs.createEmptyDirectory()
    const ipfsDirectoryHashWithFiles = await ipfs.addFilesToDirectory({
      ipfsDirectoryHash,
      ipfsFileHashes: [ entry.ipfsFileHash, anchorReceiptFileHash ],
    })
    // TODO: adding another TODO to test this tool...
    logger.info(
      { anchorReceipt, anchorReceiptFileHash, ipfsDirectoryHashWithFiles },
      'Stored Claim + Anchor Receipt in IPFS Directory',
    )
    await claimAnchorReceiptsCollection.updateOne({ _id }, { $set: { ipfsDirectoryHashWithFiles } })
    // TODO: rename some of these fields and constants asd
  }

  const registerNextDirectory = async () => {
    const logger = businessLogger.child({ method: 'registerNextDirectory' })
    const entry = await claimAnchorReceiptsCollection.findOne({
      ipfsDirectoryHashWithFiles: { $ne: null },
      registryIndex: null,
    })
    const cidCount = await ethereumRegistryContract.getCidCount()
    logger.info({ entry, cidCount }, 'Registering next IPFS directory to Ethereum')
    await ethereumRegistryContract.addCid(entry.ipfsDirectoryHashWithFiles)
    logger.trace({ entry, cidCount }, 'IPFS Directory added to Ethereum')
  }

  return {
    createDbIndices,
    insertClaimIdIPFSFileHashPair,
    setDirectoryHash,
    setAnchors,
    confirmBatchDirectory,
    verifyIPFSFileHashes,
    uploadNextAnchorReceipt,
    registerNextDirectory,
  }
}

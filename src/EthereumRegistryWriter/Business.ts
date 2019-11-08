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
  readonly setBatchDirectory: (ipfsFileHashes: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly setAnchors: (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => Promise<void>
  readonly confirmBatchDirectory: (ipfsFileHashes: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly confirmClaimFiles: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => Promise<void>
  readonly uploadNextAnchorReceipt: () => Promise<void>
  readonly registerNextDirectory: () => Promise<void>
}

interface DbEntry {
  readonly claimId: string
  readonly ipfsFileHash: string
  readonly anchorReceipt?: Partial<PoetBlockAnchor>
  readonly anchorReceiptFileHash?: string
  readonly ipfsFileHashVerified?: boolean
  readonly ipfsDirectoryHashWithFiles?: string
  readonly ipfsDirectoryHashVerified?: boolean
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
  const claimAnchorReceiptsCollection: Collection<DbEntry> = db.collection('claimAnchorReceipts')

  const createDbIndices = async () => {
    await claimAnchorReceiptsCollection.createIndex({ claimId: 1 }, { unique: true })
    await claimAnchorReceiptsCollection.createIndex({ ipfsFileHash: 1 }, { unique: true })
    await claimAnchorReceiptsCollection.createIndex({ 'anchorReceipt.ipfsDirectoryHash': 1 })
    await claimAnchorReceiptsCollection.createIndex(
      { ipfsFileHashVerified: 1, ipfsDirectoryHashVerified: 1, anchorReceiptFileHash: 1 },
      { unique: true },
    )
    await claimAnchorReceiptsCollection.createIndex({ ipfsDirectoryHashWithFiles: 1 }, { unique: true })
  }

  const insertClaimIdIPFSFileHashPair = async (claimId: string, ipfsFileHash: string): Promise<void> => {
    await claimAnchorReceiptsCollection.insertOne({ claimId, ipfsFileHash })
  }

  const setBatchDirectory = async (ipfsFileHashes: ReadonlyArray<string>, ipfsDirectoryHash: string) => {
    const logger = businessLogger.child({ method: 'setBatchDirectory' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'Setting batch directory')
    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsFileHash },
          { $set: { 'anchorReceipt.ipfsDirectoryHash': ipfsDirectoryHash } },
        ),
      ),
    )
    logger.info({ ipfsDirectoryHash, ipfsFileHashes }, 'IPFS Directory Hash set successfully')
  }

  const setAnchors =  async (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    const logger = businessLogger.child({ method: 'setAnchors' })
    logger.info({ poetAnchors }, 'Setting Po.et Anchors')

    await Promise.all(
      poetAnchors.map(anchorReceipt =>
        claimAnchorReceiptsCollection.updateOne(
          { 'anchorReceipt.ipfsDirectoryHash': anchorReceipt.ipfsDirectoryHash },
          { $set: { anchorReceipt } },
        ),
      ),
    )
  }

  const confirmBatchDirectory = async (
    ipfsFileHashes: ReadonlyArray<string>,
    ipfsDirectoryHash: string,
  ) => {
    const logger = businessLogger.child({ method: 'confirmBatchDirectory' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'Confirming batch directory')

    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        claimAnchorReceiptsCollection.updateOne(
          { ipfsFileHash, 'anchorReceipt.ipfsDirectoryHash': ipfsDirectoryHash },
          { $set: { ipfsDirectoryHashVerified: true } },
        ),
      ),
    )

    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'Batch directory confirmed')
    // TODO: do something for files that don't match the expected directory
  }

  const confirmClaimFiles = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = businessLogger.child({ method: 'confirmClaimFiles' })
    logger.debug({ claimIPFSHashPairs }, 'Confirming Claim files')
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
    if (!entry)
      return
    logger.debug({ entry })
    const { claimId, ipfsFileHash, anchorReceipt } = entry
    const anchorReceiptFileHash = await ipfs.addText()(JSON.stringify({ claimId, ipfsFileHash, ...anchorReceipt}))
    logger.debug({ anchorReceipt, anchorReceiptFileHash })
    await claimAnchorReceiptsCollection.updateOne({ claimId }, { $set: { anchorReceiptFileHash } })
    const ipfsDirectoryHash = await ipfs.createEmptyDirectory()
    const ipfsDirectoryHashWithFiles = await ipfs.addFilesToDirectory({
      ipfsDirectoryHash,
      ipfsFileHashes: [ ipfsFileHash, anchorReceiptFileHash ],
    })
    logger.info(
      { anchorReceipt, anchorReceiptFileHash, ipfsDirectoryHashWithFiles },
      'Stored Claim + Anchor Receipt in IPFS Directory',
    )
    await claimAnchorReceiptsCollection.updateOne({ claimId }, { $set: { ipfsDirectoryHashWithFiles } })
  }

  const registerNextDirectory = async () => {
    const logger = businessLogger.child({ method: 'registerNextDirectory' })
    const entry = await claimAnchorReceiptsCollection.findOne({
      ipfsDirectoryHashWithFiles: { $ne: null },
      registryIndex: null,
    }) || {}
    if (!entry)
      return
    const { claimId, ipfsDirectoryHashWithFiles } = entry
    const cidCount = await ethereumRegistryContract.getCidCount()
    logger.info({ claimId, ipfsDirectoryHashWithFiles, cidCount }, 'Registering next IPFS directory to Ethereum')
    await ethereumRegistryContract.addCid(ipfsDirectoryHashWithFiles)
    logger.trace({ claimId, ipfsDirectoryHashWithFiles, cidCount }, 'IPFS Directory added to Ethereum')
    await claimAnchorReceiptsCollection.updateOne({ claimId }, { $set: { registryIndex: cidCount } })
  }

  return {
    createDbIndices,
    insertClaimIdIPFSFileHashPair,
    setBatchDirectory,
    setAnchors,
    confirmBatchDirectory,
    confirmClaimFiles,
    uploadNextAnchorReceipt,
    registerNextDirectory,
  }
}

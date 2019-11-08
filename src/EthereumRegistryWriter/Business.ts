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
  readonly insertClaimIdFilePair: (claimId: string, claimFile: string) => Promise<void>
  readonly setBatchDirectory: (claimFiles: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly setAnchors: (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => Promise<void>
  readonly confirmBatchDirectory: (claimFiles: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly confirmClaimFiles: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => Promise<void>
  readonly uploadNextAnchorReceipt: () => Promise<void>
  readonly registerNextDirectory: () => Promise<void>
}

interface DbEntry {
  readonly claimId: string
  readonly claimFile: string
  readonly anchorReceipt?: Partial<PoetBlockAnchor>
  readonly anchorReceiptFileHash?: string
  readonly claimFileConfirmed?: boolean
  readonly batchDirectoryConfirmed?: boolean
  readonly ipfsDirectoryHashWithFiles?: string
  readonly registryIndex?: number
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
    await claimAnchorReceiptsCollection.createIndex({ claimFile: 1 }, { unique: true })
    await claimAnchorReceiptsCollection.createIndex({ 'anchorReceipt.ipfsDirectoryHash': 1 })
    await claimAnchorReceiptsCollection.createIndex(
      { claimFileConfirmed: 1, batchDirectoryConfirmed: 1, anchorReceiptFileHash: 1 },
      { unique: true },
    )
    await claimAnchorReceiptsCollection.createIndex({ ipfsDirectoryHashWithFiles: 1 }, { unique: true })
  }

  const insertClaimIdFilePair = async (claimId: string, claimFile: string): Promise<void> => {
    await claimAnchorReceiptsCollection.insertOne({ claimId, claimFile })
  }

  const setBatchDirectory = async (claimFiles: ReadonlyArray<string>, ipfsDirectoryHash: string) => {
    const logger = businessLogger.child({ method: 'setBatchDirectory' })
    logger.trace({ claimFiles, ipfsDirectoryHash }, 'Setting batch directory')

    const setBatchDirectoryForClaimFile = (claimFile: string) =>
      claimAnchorReceiptsCollection.updateOne(
        { claimFile },
        { $set: { 'anchorReceipt.ipfsDirectoryHash': ipfsDirectoryHash } },
      )

    await Promise.all(claimFiles.map(setBatchDirectoryForClaimFile))
    logger.info({ ipfsDirectoryHash, claimFiles }, 'IPFS Directory Hash set successfully')
  }

  const setAnchors =  async (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    const logger = businessLogger.child({ method: 'setAnchors' })
    logger.info({ poetAnchors }, 'Setting Po.et Anchors')

    const setAnchorReceipt = (anchorReceipt: PoetBlockAnchor) =>
      claimAnchorReceiptsCollection.updateOne(
        { 'anchorReceipt.ipfsDirectoryHash': anchorReceipt.ipfsDirectoryHash },
        { $set: { anchorReceipt } },
      )

    await Promise.all(poetAnchors.map(setAnchorReceipt))
  }

  const confirmBatchDirectory = async (
    claimFiles: ReadonlyArray<string>,
    ipfsDirectoryHash: string,
  ) => {
    const logger = businessLogger.child({ method: 'confirmBatchDirectory' })
    logger.trace({ claimFiles, ipfsDirectoryHash }, 'Confirming batch directory')

    const confirmBatchDirectory = (claimFile: string) =>
      claimAnchorReceiptsCollection.updateOne(
        { claimFile, 'anchorReceipt.ipfsDirectoryHash': ipfsDirectoryHash },
        { $set: { batchDirectoryConfirmed: true } },
      )

    await Promise.all(claimFiles.map(confirmBatchDirectory))

    logger.trace({ claimFiles, ipfsDirectoryHash }, 'Batch directory confirmed')
    // TODO: do something for files that don't match the expected directory
  }

  const confirmClaimFiles = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = businessLogger.child({ method: 'confirmClaimFiles' })
    logger.debug({ claimIPFSHashPairs }, 'Confirming Claim files')

    const confirmClaimFile = ({ claim, ipfsFileHash: claimFile }: ClaimIPFSHashPair) =>
      claimAnchorReceiptsCollection.updateOne(
        { claimId: claim.id, claimFile },
        { $set: { claimFileConfirmed: true } },
      )

    await Promise.all(claimIPFSHashPairs.map(confirmClaimFile))
    // TODO: do something for claims that don't match the expected file
  }

  const uploadNextAnchorReceipt = async () => {
    const logger = businessLogger.child({ method: 'uploadNextAnchorReceipt' })
    const entry = await claimAnchorReceiptsCollection.findOne({
      claimFileConfirmed: true,
      batchDirectoryConfirmed: true,
      anchorReceiptFileHash: null,
    })
    if (!entry)
      return
    logger.debug({ entry })
    const { claimId, claimFile, anchorReceipt } = entry
    const anchorReceiptFileHash = await ipfs.addJson({ claimId, claimFile, ...anchorReceipt})
    logger.debug({ anchorReceipt, anchorReceiptFileHash })
    await claimAnchorReceiptsCollection.updateOne({ claimId }, { $set: { anchorReceiptFileHash } })
    const ipfsDirectoryHashWithFiles = await ipfs.createDirectory([ claimFile, anchorReceiptFileHash ])
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
    })
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
    insertClaimIdFilePair,
    setBatchDirectory,
    setAnchors,
    confirmBatchDirectory,
    confirmClaimFiles,
    uploadNextAnchorReceipt,
    registerNextDirectory,
  }
}

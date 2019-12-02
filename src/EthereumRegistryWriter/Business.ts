import { PoetBlockAnchor } from '@po.et/poet-js'
import { DateTime } from 'luxon'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { identity, map, filter, tap, complement } from 'ramda'
import { TransactionReceipt } from 'web3-core'

import { EthereumRegistryContract } from 'Helpers/EthereumRegistryContract'
import { IPFS } from 'Helpers/IPFS'
import { childWithFileName } from 'Helpers/Logging'
import { asyncPipe } from 'Helpers/asyncPipe'
import { ClaimIPFSHashPair } from 'Interfaces'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
  readonly ipfs: IPFS
  readonly ethereumRegistryContract: EthereumRegistryContract
}

export interface Configuration {
  readonly maximumUnconfirmedTransactionAgeInSeconds: number
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: Configuration
}

export interface Business {
  readonly createDbIndices: () => Promise<void>
  readonly insertClaimIdFilePair: (claimId: string, claimFile: string) => Promise<void>
  readonly setBatchDirectory: (claimFiles: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly setAnchors: (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => Promise<void>
  readonly confirmBatchDirectory: (claimFiles: ReadonlyArray<string>, ipfsDirectoryHash: string) => Promise<void>
  readonly confirmClaimFiles: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => Promise<void>
  readonly uploadNextAnchorReceipt: () => Promise<void>
  readonly uploadNextClaimFileAnchorReceiptPair: () => Promise<void>
  readonly writeNextDirectoryToEthereum: () => Promise<void>
  readonly setRegistryIndex: (
    confirmClaimAndAnchorReceiptDirectory: string,
    registryIndex: number,
    transactionHash: string,
    blockHash: string,
    blockNumber: number,
  ) => Promise<void>
  readonly getEthereumTransactionReceipts: () => Promise<void>
}

interface DbEntry {
  readonly claimId: string
  readonly claimFile: string
  readonly anchorReceipt?: Partial<PoetBlockAnchor>
  readonly anchorReceiptFile?: string
  readonly claimFileConfirmed?: boolean
  readonly batchDirectoryConfirmed?: boolean
  readonly claimAndAnchorReceiptDirectory?: string
  readonly registryIndex?: number
  readonly registryAdditionTransactionReceipt?: {
    readonly transactionHash?: string
    readonly transactionCreationDate?: Date
    readonly blockHash?: string
    readonly blockNumber?: number, // comma due to some tslint randomness, will move to eslint in the future
  }
  readonly onCidAdded?: {
    readonly transactionHash?: string
    readonly blockHash?: string
    readonly blockNumber?: number, // comma due to some tslint randomness, will move to eslint in the future
  }
}

export const Business = ({
  dependencies: {
    logger,
    db,
    ipfs,
    ethereumRegistryContract,
  },
  configuration: {
    maximumUnconfirmedTransactionAgeInSeconds,
  },
}: Arguments): Business => {
  const businessLogger: Pino.Logger = childWithFileName(logger, __filename)
  const claimAnchorReceiptsCollection: Collection<DbEntry> = db.collection('claimAnchorReceipts')

  const createDbIndices = async () => {
    await claimAnchorReceiptsCollection.createIndex({ claimId: 1 }, { unique: true })
    await claimAnchorReceiptsCollection.createIndex({ claimFile: 1 }, { unique: true })
    await claimAnchorReceiptsCollection.createIndex({ 'anchorReceipt.ipfsDirectoryHash': 1 })
    await claimAnchorReceiptsCollection.createIndex(
      { claimFileConfirmed: 1, batchDirectoryConfirmed: 1, anchorReceiptFile: 1 },
      { unique: true },
    )
    await claimAnchorReceiptsCollection.createIndex({ claimAndAnchorReceiptDirectory: 1 }, { unique: true })
  }

  const insertClaimIdFilePair = async (claimId: string, claimFile: string): Promise<void> => {
    await claimAnchorReceiptsCollection.insertOne({ claimId, claimFile })
  }

  const setBatchDirectory = async (claimFiles: ReadonlyArray<string>, batchDirectory: string) => {
    const logger = businessLogger.child({ method: 'setBatchDirectory' })
    logger.debug({ claimFiles, batchDirectory }, 'Setting batch directory')

    const setBatchDirectoryForClaimFile = (claimFile: string) =>
      claimAnchorReceiptsCollection.updateOne(
        { claimFile },
        { $set: { 'anchorReceipt.ipfsDirectoryHash': batchDirectory } },
      )

    await Promise.all(claimFiles.map(setBatchDirectoryForClaimFile))
    logger.info({ batchDirectory, claimFiles }, 'Batch directory set successfully')
  }

  const setAnchors =  async (poetAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    const logger = businessLogger.child({ method: 'setAnchors' })
    logger.debug({ poetAnchors }, 'Setting anchor receipts')

    const setAnchorReceipt = (anchorReceipt: PoetBlockAnchor) =>
      claimAnchorReceiptsCollection.updateOne(
        { 'anchorReceipt.ipfsDirectoryHash': anchorReceipt.ipfsDirectoryHash },
        { $set: { anchorReceipt } },
      )

    await Promise.all(poetAnchors.map(setAnchorReceipt))
    logger.info({ poetAnchors }, 'Anchors receipts set')
  }

  const confirmBatchDirectory = async (
    claimFiles: ReadonlyArray<string>,
    batchDirectory: string,
  ) => {
    const logger = businessLogger.child({ method: 'confirmBatchDirectory' })
    logger.debug({ claimFiles, batchDirectory }, 'Confirming batch directory')

    const confirmBatchDirectory = (claimFile: string) =>
      claimAnchorReceiptsCollection.updateOne(
        { claimFile, 'anchorReceipt.ipfsDirectoryHash': batchDirectory },
        { $set: { batchDirectoryConfirmed: true } },
      )

    await Promise.all(claimFiles.map(confirmBatchDirectory))

    logger.info({ claimFiles, batchDirectory }, 'Batch directory confirmed')

    const findUnexpectedBatchDirectoryMatch = (claimFile: string) =>
      claimAnchorReceiptsCollection.findOne(
        { claimFile, 'anchorReceipt.ipfsDirectoryHash': { $ne: batchDirectory } },
        { projection: { _id: 0, claimFile: 1, ipfsDirectoryHash: 1 } },
      )

    const unexpectedBatchDirectoryMatches = (await Promise.all(claimFiles.map(findUnexpectedBatchDirectoryMatch)))
      .filter(identity)

    if (unexpectedBatchDirectoryMatches.length)
      logger.warn(
        { unexpectedBatchDirectoryMatches, batchDirectory },
        'These claims were expected to have a different Batch Directory.',
      )
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

    logger.info({ claimIPFSHashPairs }, 'Confirmed Claim files')

    const findUnexpectedClaimFile = ({ claim, ipfsFileHash: claimFile }: ClaimIPFSHashPair) =>
      claimAnchorReceiptsCollection.findOne(
        { claimId: claim.id, claimFile: { $ne: claimFile } },
        { projection: { _id: 0, claimId: 1, claimFile: 1 } },
      )

    const unexpectedClaimFileMatches = (await Promise.all(claimIPFSHashPairs.map(findUnexpectedClaimFile)))
      .filter(identity)

    if (unexpectedClaimFileMatches.length)
      logger.warn({ unexpectedClaimFileMatches }, 'These claims were expected be stored in a different file.')
  }

  const uploadNextAnchorReceipt = async () => {
    const logger = businessLogger.child({ method: 'uploadNextAnchorReceipt' })
    const entry = await claimAnchorReceiptsCollection.findOne({
      claimFileConfirmed: true,
      batchDirectoryConfirmed: true,
      anchorReceiptFile: null,
    })
    if (!entry)
      return
    logger.debug(entry, 'Storing Anchor Receipt in an IPFS file')
    const { claimId, claimFile, anchorReceipt } = entry
    const anchorReceiptFile = await ipfs.addJson({ claimId, claimFile, ...anchorReceipt })
    logger.info({ anchorReceipt, anchorReceiptFile }, 'Stored Anchor Receipt in an IPFS file')
    await claimAnchorReceiptsCollection.updateOne({ claimId }, { $set: { anchorReceiptFile } })
  }

  const uploadNextClaimFileAnchorReceiptPair = async () => {
    const logger = businessLogger.child({ method: 'uploadNextClaimFileAnchorReceiptPair' })
    const entry = await claimAnchorReceiptsCollection.findOne({
      anchorReceiptFile: { $ne: null },
      claimAndAnchorReceiptDirectory: null,
    })
    if (!entry)
      return
    logger.debug(entry, 'Storing (claim + anchor receipt) in an IPFS directory')
    const { claimId, claimFile, anchorReceiptFile } = entry
    const claimAndAnchorReceiptDirectory = await ipfs.createDirectory([ claimFile, anchorReceiptFile ])
    logger.info({ ...entry, claimAndAnchorReceiptDirectory }, 'Stored (claim + anchor receipt) in an IPFS Directory')
    await claimAnchorReceiptsCollection.updateOne({ claimId }, { $set: { claimAndAnchorReceiptDirectory } })
  }

  const writeNextDirectoryToEthereum = async () => {
    const logger = businessLogger.child({ method: 'registerNextDirectory' })

    const entry = await claimAnchorReceiptsCollection.findOneAndUpdate(
      {
        claimAndAnchorReceiptDirectory: { $ne: null },
        $or: [
          { 'registryAdditionTransactionReceipt.transactionCreationDate': null },
          { $and: [
            { 'registryAdditionTransactionReceipt.transactionCreationDate': {
              $lt: DateTime.utc().minus({ seconds: maximumUnconfirmedTransactionAgeInSeconds }).toJSDate(),
            } },
            { 'registryAdditionTransactionReceipt.blockHash': null },
          ]},
        ],
      },
      {
        $set: { 'registryAdditionTransactionReceipt.transactionCreationDate': new Date() },
      },
    )
    if (!entry.value)
      return
    const { claimId, claimAndAnchorReceiptDirectory } = entry.value
    logger.debug(
      { claimId, claimAndAnchorReceiptDirectory },
      'Adding (claim + anchor receipt) directory to Ethereum',
    )
    const transactionHash = await ethereumRegistryContract.addCid(claimAndAnchorReceiptDirectory)

    logger.info(
      { claimId, claimAndAnchorReceiptDirectory, transactionHash },
      '(claim + anchor receipt) transaction sent',
    )

    await claimAnchorReceiptsCollection.updateOne(
      { claimAndAnchorReceiptDirectory },
      { $set: { 'registryAdditionTransactionReceipt.transactionHash': transactionHash } },
    )

  }

  const setRegistryIndex = async (
    claimAndAnchorReceiptDirectory: string,
    registryIndex: number,
    transactionHash: string,
    blockHash: string,
    blockNumber: number,
  ) => {
    const logger = businessLogger.child({ method: 'setRegistryIndex' })
    await claimAnchorReceiptsCollection.updateOne(
      { claimAndAnchorReceiptDirectory },
      { $set: { registryIndex, onCidAdded: { transactionHash, blockHash, blockNumber } } },
    )
    logger.info(
      { claimAndAnchorReceiptDirectory, registryIndex, blockNumber, transactionHash },
      'Registry index for (claim + anchor receipt) directory set',
    )
  }

  const getEthereumTransactionReceipts = async () => {
    const logger = businessLogger.child({ method: 'getEthereumTransactionReceipts' })

    logger.trace('Looking for transactions without confirmation')

    const entries = await claimAnchorReceiptsCollection.find(
      {
        'registryAdditionTransactionReceipt.transactionHash': { $ne: null },
        'registryAdditionTransactionReceipt.blockHash': null,
      },
      { projection: { 'registryAdditionTransactionReceipt.transactionHash': 1 } },
    ).toArray()

    if (!entries.length) {
      logger.trace('No transactions without confirmation found')
      return
    }

    const transactionHashes = entries.map(_ => _.registryAdditionTransactionReceipt.transactionHash)

    logger.debug({ transactionHashes }, 'These transactions have no known confirmations yet')

    const receiptToSimplified = ({ transactionHash, blockHash, blockNumber }: TransactionReceipt) => ({
      transactionHash,
      blockHash,
      blockNumber,
    })

    const logErrors = (transactionReceipt: TransactionReceipt) => {
      logger.error({ transactionReceipt }, 'Error in transaction receipt')
    }

    const transactionReceiptIsOk = (transactionReceipt: TransactionReceipt) => transactionReceipt.status

    const filterAndLogErrors = asyncPipe(
      tap(asyncPipe(
        filter(complement(transactionReceiptIsOk)),
        map(logErrors),
      )),
      filter(transactionReceiptIsOk),
    )

    const getReceipts = asyncPipe(
      map(ethereumRegistryContract.getTransactionReceipt),
      Promise.all.bind(Promise),
      filter(identity),
      filterAndLogErrors,
      map(receiptToSimplified),
    ) as (transactionHashes: ReadonlyArray<string>) => Promise<ReadonlyArray<Partial<TransactionReceipt>>>

    const receipts = await getReceipts(transactionHashes)

    if (!receipts.length) {
      logger.trace({ transactionHashes }, 'No transactions receipts available yet for these transactions')
      return
    }

    logger.debug({ receipts }, 'Got these transaction receipts')

    await Promise.all(receipts.map(({ transactionHash, blockHash, blockNumber }) =>
      claimAnchorReceiptsCollection.updateOne(
        { 'registryAdditionTransactionReceipt.transactionHash': transactionHash },
        { $set: {
          'registryAdditionTransactionReceipt.blockHash': blockHash,
          'registryAdditionTransactionReceipt.blockNumber': blockNumber,
        } },
      ),
    ))

    logger.info({ receipts }, 'Transaction receipts set')
  }

  return {
    createDbIndices,
    insertClaimIdFilePair,
    setBatchDirectory,
    setAnchors,
    confirmBatchDirectory,
    confirmClaimFiles,
    uploadNextAnchorReceipt,
    uploadNextClaimFileAnchorReceiptPair,
    writeNextDirectoryToEthereum,
    setRegistryIndex,
    getEthereumTransactionReceipts,
  }
}

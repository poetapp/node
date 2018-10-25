import * as bs58 from 'bs58'
import { equals, allPass, pipe, values, sum } from 'ramda'

import { PREFIX_BARD, PREFIX_POET, Block, Transaction, VOut } from 'Helpers/Bitcoin'
import { isTruthy } from 'Helpers/isTruthy'

declare enum StorageProtocolRefactor {
  IPFS = 0,
}
interface PoetAnchorRefactor {
  readonly prefix: string
  readonly version: number
  readonly storageProtocol: StorageProtocolRefactor
  readonly ipfsDirectoryHash: string
}

interface PoetTransactionAnchorRefactor extends PoetAnchorRefactor {
  readonly transactionId: string
}

interface PoetBlockAnchorRefactor extends PoetTransactionAnchorRefactor {
  readonly blockHeight: number
  readonly blockHash: string
}

interface VOutWithTxId extends VOut {
  readonly transactionId: string
}

const AnchorSectionsLengths = {
  Prefix: 4,
  StorageProtocol: 1,
  Version: 2,
  IPFSHash: 34,
}

const sumObjectValues = pipe(
  values,
  sum,
)

const anchorByteLength = sumObjectValues(AnchorSectionsLengths)

export const blockToPoetAnchors = (block: Block): ReadonlyArray<PoetAnchorRefactor> =>
  block.tx
    .map(transactionToDataOutput)
    .filter(isTruthy)
    .reduce(dataOutputToPoetTransactionAnchors, [])
    .filter(poetAnchorHasCorrectPrefix)
    .map(poetAnchorWithBlockData(block))

const dataOutputToPoetTransactionAnchors = (
  acc: ReadonlyArray<PoetTransactionAnchorRefactor>,
  dataOutput: VOutWithTxId
) => {
  const buffer = dataOutputToBuffer(dataOutput)

  return isCorrectBufferLength(buffer)
    ? [...acc, combineAnchorAndTransactionId(bufferToPoetAnchor(buffer), dataOutput)]
    : acc
}

const transactionToDataOutput = (transaction: Transaction): VOutWithTxId | undefined => {
  const outputs = transactionToOutputs(transaction)
  return outputs.find(outputIsDataOutput)
}

const transactionToOutputs = (transaction: Transaction): ReadonlyArray<VOutWithTxId> =>
  transaction.vout.map(vout => ({
    ...vout,
    transactionId: transaction.txid,
  }))

const outputIsDataOutput = (output: VOut) => output.scriptPubKey.type === 'nulldata'

const combineAnchorAndTransactionId = (
  anchor: PoetAnchorRefactor,
  output: VOutWithTxId
): PoetTransactionAnchorRefactor => {
  return {
    ...anchor,
    transactionId: output.transactionId,
  }
}

const dataOutputToData = (dataOutput: VOutWithTxId): string => {
  const { asm } = dataOutput.scriptPubKey
  const data = asm.split(' ')[1]
  return data || ''
}

const dataToBuffer = (data: string): Buffer => {
  return Buffer.from(data, 'hex')
}

export const dataOutputToBuffer = pipe(
  dataOutputToData,
  dataToBuffer,
)

export const isCorrectBufferLength = (buffer: Buffer) => buffer.byteLength >= anchorByteLength

export const bufferToPoetAnchor = (buffer: Buffer): PoetAnchorRefactor => {
  const prefix = buffer.slice(0, 4).toString()
  const version = buffer.slice(4, 6).readUInt16BE(0)
  const storageProtocol = buffer.readInt8(6)
  const ipfsDirectoryHash = bs58.encode(buffer.slice(7))

  return {
    storageProtocol,
    prefix,
    version,
    ipfsDirectoryHash,
  }
}

const poetAnchorHasCorrectPrefix = (poetAnchor: PoetAnchorRefactor) =>
  [PREFIX_BARD, PREFIX_POET].includes(poetAnchor.prefix)

const poetAnchorWithBlockData = (block: Block) => (
  poetAnchor: PoetTransactionAnchorRefactor
): PoetBlockAnchorRefactor => ({
  ...poetAnchor,
  blockHeight: block.height,
  blockHash: block.hash,
})

const anchorPrefixMatches = (prefix: string) => (anchor: PoetAnchorRefactor) => equals(anchor.prefix, prefix)
const anchorVersionMatches = (version: number) => (anchor: PoetAnchorRefactor) => equals(anchor.version, version)

export const anchorPrefixAndVersionMatch = (prefix: string, version: number) =>
  allPass([anchorPrefixMatches(prefix), anchorVersionMatches(version)])

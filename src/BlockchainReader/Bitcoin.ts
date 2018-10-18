import { PoetAnchor, PoetBlockAnchor, PoetTransactionAnchor } from '@po.et/poet-js'
import { equals, allPass, pipe, values, sum } from 'ramda'

import { PREFIX_BARD, PREFIX_POET, Block, Transaction, VOut } from 'Helpers/Bitcoin'
import { isTruthy } from 'Helpers/isTruthy'

interface VOutWithTxId extends VOut {
  readonly transactionId: string
}

const AnchorSectionsLengths = {
  Prefix: 4,
  StorageProtocol: 1,
  Version: 2,
  IPFSHash: 46,
}

const sumObjectValues = pipe(
  values,
  sum
)

const anchorByteLength = sumObjectValues(AnchorSectionsLengths)

export const blockToPoetAnchors = (block: Block): ReadonlyArray<PoetBlockAnchor> =>
  block.tx
    .map(transactionToDataOutput)
    .filter(isTruthy)
    .reduce(dataOutputToPoetTransactionAnchors, [])
    .filter(poetAnchorHasCorrectPrefix)
    .map(poetAnchorWithBlockData(block))

const dataOutputToPoetTransactionAnchors = (acc: ReadonlyArray<PoetTransactionAnchor>, dataOutput: VOutWithTxId) => {
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

const combineAnchorAndTransactionId = (anchor: PoetAnchor, output: VOutWithTxId): PoetTransactionAnchor => {
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
  dataToBuffer
)

export const isCorrectBufferLength = (buffer: Buffer) => buffer.byteLength >= anchorByteLength

export const bufferToPoetAnchor = (buffer: Buffer): PoetAnchor => {
  const prefix = buffer.slice(0, 4).toString()
  const version = Array.from(buffer.slice(4, 6))
  const storageProtocol = buffer.readInt8(6)
  const ipfsDirectoryHash = buffer.slice(7).toString()
  return {
    storageProtocol,
    prefix,
    version,
    ipfsDirectoryHash,
  }
}

const poetAnchorHasCorrectPrefix = (poetAnchor: PoetAnchor) => [PREFIX_BARD, PREFIX_POET].includes(poetAnchor.prefix)

const poetAnchorWithBlockData = (block: Block) => (poetAnchor: PoetTransactionAnchor): PoetBlockAnchor => ({
  ...poetAnchor,
  blockHeight: block.height,
  blockHash: block.hash,
})

const anchorPrefixMatches = (prefix: string) => (anchor: PoetAnchor) => equals(anchor.prefix, prefix)
const anchorVersionMatches = (version: ReadonlyArray<number>) => (anchor: PoetAnchor) => equals(anchor.version, version)

export const anchorPrefixAndVersionMatch = (prefix: string, version: ReadonlyArray<number>) =>
  allPass([anchorPrefixMatches(prefix), anchorVersionMatches(version)])

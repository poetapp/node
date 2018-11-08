import { PoetAnchor, PoetBlockAnchor, PoetTransactionAnchor } from '@po.et/poet-js'
import * as bs58 from 'bs58'
import { equals, allPass, pipe, values, sum } from 'ramda'

import { Block, Transaction, VOut } from 'Helpers/Bitcoin'
import { isTruthy } from 'Helpers/isTruthy'

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

export const blockToPoetAnchors = (block: Block): ReadonlyArray<PoetBlockAnchor> =>
  block.tx
    .map(transactionToDataOutput)
    .filter(isTruthy)
    .reduce(dataOutputToPoetTransactionAnchors, [])
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
  dataToBuffer,
)

export const isCorrectBufferLength = (buffer: Buffer) => buffer.byteLength >= anchorByteLength

export const bufferToPoetAnchor = (buffer: Buffer): PoetAnchor => {
  const prefix = buffer.slice(0, 4).toString()
  const version = buffer.readUInt16BE(4)
  const storageProtocol = buffer.readInt8(6)
  const ipfsDirectoryHash = bs58.encode(buffer.slice(7))

  return {
    storageProtocol,
    prefix,
    version,
    ipfsDirectoryHash,
  }
}

const poetAnchorWithBlockData = (block: Block) => (poetAnchor: PoetTransactionAnchor): PoetBlockAnchor => ({
  ...poetAnchor,
  blockHeight: block.height,
  blockHash: block.hash,
})

const anchorPrefixMatches = (prefix: string) => (anchor: PoetAnchor) => equals(anchor.prefix, prefix)
const anchorVersionMatches = (version: number) => (anchor: PoetAnchor) => equals(anchor.version, version)

export const anchorPrefixAndVersionMatch = (prefix: string, version: number) =>
  allPass([anchorPrefixMatches(prefix), anchorVersionMatches(version)])

import { PoetAnchor, PoetBlockAnchor, PoetTransactionAnchor } from '@po.et/poet-js'
import { equals, allPass } from 'ramda'

import { PREFIX_BARD, PREFIX_POET, Block, Transaction, VOut } from 'Helpers/Bitcoin'
import { isTruthy } from 'Helpers/isTruthy'

interface VOutWithTxId extends VOut {
  readonly transactionId: string
}

export const blockToPoetAnchors = (block: Block): ReadonlyArray<PoetBlockAnchor> =>
  block.tx
    .map(transactionToPoetAnchor)
    .filter(isTruthy)
    .filter(poetAnchorHasCorrectPrefix)
    .map(poetAnchorWithBlockData(block))

const transactionToPoetAnchor = (transaction: Transaction): PoetTransactionAnchor | undefined => {
  const outputs = transactionToOutputs(transaction)
  const dataOutput = outputs.find(outputIsDataOutput)
  return dataOutput && dataOutputToPoetTransactionAnchor(dataOutput)
}

const transactionToOutputs = (transaction: Transaction): ReadonlyArray<VOutWithTxId> =>
  transaction.vout.map(vout => ({
    ...vout,
    transactionId: transaction.txid,
  }))

const outputIsDataOutput = (output: VOut) => output.scriptPubKey.type === 'nulldata'

const dataOutputToPoetTransactionAnchor = (output: VOutWithTxId): PoetTransactionAnchor => {
  const anchor = dataToPoetAnchor(dataOutputToData(output))
  return {
    ...anchor,
    transactionId: output.transactionId,
  }
}

const dataOutputToData = (dataOutput: VOutWithTxId): string => {
  const { asm } = dataOutput.scriptPubKey
  return asm.split(' ')[1]
}

export const dataToPoetAnchor = (data: string): PoetAnchor => {
  const buffer = Buffer.from(data, 'hex')
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

import { TransactionPoetTimestamp } from '@po.et/poet-js'
import * as bitcore from 'bitcore-lib'

export const PREFIX_POET = Buffer.from('POET')
export const PREFIX_BARD = Buffer.from('BARD')

export function getPoetTimestamp(tx: bitcore.Transaction): TransactionPoetTimestamp {
  const poetOutput = tx.outputs.filter(isOutputDataOut).find(isOutputCorrectNetwork)

  const poetTimestampBuffer: Buffer = poetOutput && poetOutput.script.getData()

  return (
    poetTimestampBuffer && {
      transactionId: tx.id,
      outputIndex: tx.outputs.indexOf(poetOutput),
      prefix: poetTimestampBuffer.slice(0, 4).toString(),
      version: Array.from(poetTimestampBuffer.slice(4, 8)),
      ipfsDirectoryHash: poetTimestampBuffer.slice(8).toString(),
    }
  )
}

function isOutputDataOut(output: bitcore.Output) {
  return output.script.classify() === bitcore.Script.types.DATA_OUT
}

function isOutputCorrectNetwork(output: bitcore.Output) {
  const data: Buffer = output.script.getData()
  return data.indexOf(PREFIX_POET) === 0 || data.indexOf(PREFIX_BARD) === 0
}

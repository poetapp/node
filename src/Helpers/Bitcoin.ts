import * as bitcore from 'bitcore-lib'

export const PREFIX_POET = Buffer.from('POET')
export const PREFIX_BARD = Buffer.from('BARD')

export interface BlockchainPoetTimestamp {
  readonly transactionId: string
  readonly outputIndex: number
  readonly prefix: string
  readonly version: ReadonlyArray<number>
  readonly ipfsHash: string
}

export function getPoetData(tx: bitcore.Transaction): BlockchainPoetTimestamp {
  const poetOutput = tx.outputs
    .filter(isOutputDataOut)
    .find(isOutputCorrectNetwork)

  const poetData: Buffer = poetOutput && poetOutput.script.getData()

  return poetData && {
    transactionId: tx.id,
    outputIndex: tx.outputs.indexOf(poetOutput),
    prefix: poetData.slice(0, 4).toString(),
    version: Array.from(poetData.slice(4, 8)),
    ipfsHash: poetData.slice(8).toString()
  }
}

function isOutputDataOut(output: bitcore.Output) {
  return output.script.classify() === bitcore.Script.types.DATA_OUT
}

function isOutputCorrectNetwork(output: bitcore.Output) {
  const data: Buffer = output.script.getData()
  return data.indexOf(PREFIX_POET) === 0
    || data.indexOf(PREFIX_BARD) === 0
}

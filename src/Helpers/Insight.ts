import * as bitcore from 'bitcore-lib'
import fetch from 'node-fetch'

export class InsightHelper {
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  getUtxo = async (address: string): Promise<ReadonlyArray<bitcore.Transaction.UnspentOutput>> => {
    const response = await fetch(`${this.url}/addrs/${address}/utxo`)

    if (!response.ok)
      throwError(await response.text())

    const rawutxo = await response.json()

    if (!Array.isArray(rawutxo)) {
      console.error({
        action: 'InsightHelper.getUtxo',
        message: 'Expected server response to be an Array. ',
        actualResponse: rawutxo
      })
      throw new UnexpectedResponseError('InsightHelper.getUtxo was expecting server response to be an Array. ')
    }

    return rawutxo.map(_ => new bitcore.Transaction.UnspentOutput(_))
  }

  broadcastTx = async (transaction: bitcore.Transaction): Promise<string> => {
    const rawtx = transaction.serialize()

    const response = await fetch(`${this.url}/tx/send`, {
      method: 'POST',
      body: JSON.stringify({ rawtx }),
      headers: {
        'content-type': 'application/json'
      }
    })

    if (!response.ok)
      throwError(await response.text())

    return await response.json()
  }

  /**
   * @throws BlockHeightOutOfRangeError, InsightError
   */
  getBlockHash = async (height: number): Promise<string> => {
    const response = await fetch(`${this.url}/block-index/${height}`)

    if (!response.ok)
      throwError(await response.text())

    const json = await response.json()

    return json.blockHash
  }

  getBlock = async (hash: string): Promise<bitcore.Block> => {
    const response = await fetch(`${this.url}/rawblock/${hash}`)

    if (!response.ok)
      throwError(await response.text())

    const json = await response.json()

    return new bitcore.Block(Buffer.from(json.rawblock, 'hex'))
  }
}

export class InsightError extends Error {
  readonly message: string

  constructor(message?: string, ...params: any[]) {
    super(...params)
    this.message = message
  }
}

export class UnexpectedResponseError extends InsightError { }

export class BlockHeightOutOfRangeError extends InsightError { }

function throwError(serverResponse: string) {
  if (serverResponse === 'Block height out of range. Code:-8')
    throw new BlockHeightOutOfRangeError()
  throw new InsightError(serverResponse)
}
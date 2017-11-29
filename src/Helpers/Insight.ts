import * as bitcore from 'bitcore-lib'
import fetch from 'node-fetch'

export class InsightHelper {
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  getUtxo = async (address: string): Promise<ReadonlyArray<bitcore.Transaction.UnspentOutput>> => {
    const utxoResponse = await fetch(`${this.url}/addrs/${address}/utxo`)
    const rawutxo = await utxoResponse.json()

    if (!Array.isArray(rawutxo)) {
      console.error({
        message: 'InsightHelper.getUtxo was expecting server response to be an Array. ',
        actualResponse: rawutxo
      })
      throw new Error('InsightHelper.getUtxo was expecting server response to be an Array. ')
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
      throw new Error(JSON.stringify({
        message: 'Unable to broadcast transaction',
        reason: await response.text()
      }))

    return await response.json()

  }
}

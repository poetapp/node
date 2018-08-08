import { describe } from 'riteway'
import * as bitcore from 'bitcore-lib'
import { getPoetTimestamp, isOutputDataOut, isOutputCorrectNetwork } from './Bitcoin'

describe('Bitcoin', async (should: any) => {
  const { assert } = should('')

  const privateKey = new bitcore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
  const utxo = [new bitcore.Transaction.UnspentOutput({
    "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
    "outputIndex" : 0,
    "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
    "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
    "satoshis" : 50000
  })];

  var transaction = new bitcore.Transaction()
    .from(utxo)
    .to('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
    .sign(privateKey);

    console.log(transaction)

  {
    const actual = getPoetTimestamp(transaction)

    assert({
      given: 'a inc function like a promise',
      should: 'return the number 1',
      actual,
      expected: 1,
    })
  }
})

import * as bitcore from 'bitcore-lib'
import { describe } from 'riteway'
import { getPoetTimestamp } from './Bitcoin'

const createTransaction = (prefix: string) => {
  // All data is a mock
  const privateKey = new bitcore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy')
  const utxo = [
    new bitcore.Transaction.UnspentOutput({
      txId: '115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986',
      outputIndex: 0,
      address: '17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV',
      script: '76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac',
      satoshis: 50000,
    }),
  ]

  return new bitcore.Transaction()
    .from(utxo)
    .to('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
    .addData(new Buffer(`${prefix}0000ipfsDirectoryHash`))
    .sign(privateKey)
}

describe('Bitcoin', async (should: any) => {
  const { assert } = should('')
  const prefixes = ['POET', 'BARD']

  prefixes.forEach(prefix => {
    const transaction = createTransaction(prefix)
    const actual = getPoetTimestamp(transaction)

    assert({
      given: `a transaction with the prefix ${prefix}`,
      should: 'return the property transactionId',
      actual: actual.hasOwnProperty('transactionId'),
      expected: true,
    })

    assert({
      given: `a transaction with the prefix ${prefix}`,
      should: 'return the property outputIndex equal 1',
      actual: actual.outputIndex === 1,
      expected: true,
    })

    assert({
      given: `a transaction with the prefix ${prefix}`,
      should: 'return the property prefix with POET',
      actual: actual.prefix === prefix,
      expected: true,
    })

    assert({
      given: `a transaction with the prefix ${prefix}`,
      should: 'return the property version as array of char codes',
      actual: Array.isArray(actual.version),
      expected: true,
    })

    const version = actual.version.map(code => String.fromCharCode(code)).join('')

    assert({
      given: `a transaction with the prefix ${prefix}`,
      should: 'return the property version and is possible to get the version 0000',
      actual: version,
      expected: '0000',
    })
  })

  {
    const transaction = createTransaction('')
    const actual = getPoetTimestamp(transaction)

    assert({
      given: `a transaction without a valid prefix`,
      should: 'return undefined',
      actual,
      expected: undefined,
    })
  }
})

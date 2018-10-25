import * as bs58 from 'bs58'
import { describe, Try } from 'riteway'

import { IllegalPrefixLength, IllegalVersionLength, poetAnchorToData } from './Bitcoin'

import { PREFIX_BARD, PREFIX_POET } from 'Helpers/Bitcoin'

enum StorageProtocolRefactor {
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

describe('Bitcoin.getData', async assert => {
  {
    const testGetData = (poetAnchor: PoetAnchorRefactor) => {
      const data = poetAnchorToData(poetAnchor)
      const buffer = Buffer.from(data, 'hex')

      const given = 'a bitcoin-encoded Po.et data buffer'

      assert({
        given,
        should: 'match the prefix',
        actual: buffer.slice(0, 4).toString(),
        expected: poetAnchor.prefix,
      })

      assert({
        given,
        should: 'match the version',
        actual: buffer.slice(4, 6).readUInt16BE(0),
        expected: poetAnchor.version,
      })

      assert({
        given,
        should: 'match the storage protocol',
        actual: buffer.readInt8(6),
        expected: poetAnchor.storageProtocol,
      })

      assert({
        given,
        should: 'match the message',
        actual: bs58.encode(buffer.slice(7)),
        expected: poetAnchor.ipfsDirectoryHash,
      })
    }

    const poetAnchor: PoetAnchorRefactor = {
      prefix: PREFIX_POET,
      version: 2,
      storageProtocol: StorageProtocolRefactor.IPFS,
      ipfsDirectoryHash: 'QmWvm25gWNrtmZRmPw8n7okH71ComnmtBgss1KCseGHqjn',
    }

    testGetData(poetAnchor)
    testGetData({
      ...poetAnchor,
      prefix: PREFIX_BARD,
      ipfsDirectoryHash: 'Qmed52rzQ2C71mZbLscqQBQEhqcYZ1qjDX3Ugm6UHTasCY',
    })
    testGetData({ ...poetAnchor, prefix: PREFIX_BARD, version: 21 })
    testGetData({
      ...poetAnchor,
      prefix: PREFIX_BARD,
      version: 21,
      ipfsDirectoryHash: 'QmWvm25gWNrtmZRmPw8n7okH71ComnmtBgss1KCseGHqjn',
    })
  }

  {
    const poetAnchor: PoetAnchorRefactor = {
      prefix: PREFIX_POET,
      version: 12,
      storageProtocol: StorageProtocolRefactor.IPFS,
      ipfsDirectoryHash: 'QmWvm25gWNrtmZRmPw8n7okH71ComnmtBgss1KCseGHqjn',
    }

    const tryPrefix = Try(poetAnchorToData, { ...poetAnchor, prefix: 'TOO_LONG' })

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect prefix length',
      should: 'fail with IllegalPrefixLength',
      actual: tryPrefix instanceof Error,
      expected: true,
    })

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect prefix length',
      should: 'fail with IllegalPrefixLength',
      actual: tryPrefix instanceof IllegalPrefixLength,
      expected: true,
    })

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect prefix length',
      should: 'fail with IllegalPrefixLength',
      actual: tryPrefix instanceof IllegalVersionLength,
      expected: false,
    })

    // assert({
    //   given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
    //   should: 'fail with IllegalVersionLength',
    //   actual: Try(poetAnchorToData, { ...poetAnchor, version: 234 }) instanceof IllegalVersionLength,
    //   expected: true,
    // })
  }
})

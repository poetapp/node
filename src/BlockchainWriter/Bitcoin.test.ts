import { PoetAnchor, StorageProtocol } from '@po.et/poet-js'
import * as bs58 from 'bs58'
import { describe, Try } from 'riteway'

import { IllegalPrefixLength, IllegalVersionLength, poetAnchorToData } from './Bitcoin'

import { PREFIX_BARD, PREFIX_POET } from 'Helpers/Bitcoin'

describe('Bitcoin.getData', async assert => {
  {
    const testGetData = (poetAnchor: PoetAnchor) => {
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
        actual: Array.from(buffer.slice(4, 6)),
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

    const poetAnchor: PoetAnchor = {
      prefix: PREFIX_POET,
      version: [0, 2],
      storageProtocol: StorageProtocol.IPFS,
      ipfsDirectoryHash: 'QmWvm25gWNrtmZRmPw8n7okH71ComnmtBgss1KCseGHqjn',
    }

    testGetData(poetAnchor)
    testGetData({
      ...poetAnchor,
      prefix: PREFIX_BARD,
      ipfsDirectoryHash: 'Qmed52rzQ2C71mZbLscqQBQEhqcYZ1qjDX3Ugm6UHTasCY',
    })
    testGetData({ ...poetAnchor, prefix: PREFIX_BARD, version: [2, 1] })
    testGetData({
      ...poetAnchor,
      prefix: PREFIX_BARD,
      version: [2, 1],
      ipfsDirectoryHash: 'QmWvm25gWNrtmZRmPw8n7okH71ComnmtBgss1KCseGHqjn',
    })
  }

  {
    const poetAnchor: PoetAnchor = {
      prefix: PREFIX_POET,
      version: [1, 2],
      storageProtocol: StorageProtocol.IPFS,
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

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail with IllegalVersionLength',
      actual: Try(poetAnchorToData, { ...poetAnchor, version: [2, 3, 4] }) instanceof IllegalVersionLength,
      expected: true,
    })
  }
})

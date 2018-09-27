import { PoetAnchor, StorageProtocol } from '@po.et/poet-js'
import { describe, Try } from 'riteway'

import { poetAnchorToData } from './Bitcoin'

import { PREFIX_BARD, PREFIX_POET } from 'Helpers/Bitcoin'

describe('Bitcoin.getData', async should => {
  const { assert } = should()

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
        actual: buffer.slice(7).toString(),
        expected: poetAnchor.ipfsDirectoryHash,
      })
    }

    const poetAnchor: PoetAnchor = {
      prefix: PREFIX_POET,
      version: [0, 2],
      storageProtocol: StorageProtocol.IPFS,
      ipfsDirectoryHash: 'ipfsDirectoryHash',
    }

    testGetData(poetAnchor)
    testGetData({ ...poetAnchor, prefix: PREFIX_BARD, ipfsDirectoryHash: 'another ipfsDirectoryHash' })
    testGetData({ ...poetAnchor, prefix: PREFIX_BARD, version: [2, 1] })
    testGetData({ ...poetAnchor, prefix: PREFIX_BARD, version: [2, 1], ipfsDirectoryHash: 'another ipfsDirectoryHash' })
  }

  {
    const poetAnchor: PoetAnchor = {
      prefix: PREFIX_POET,
      version: [1, 2],
      storageProtocol: StorageProtocol.IPFS,
      ipfsDirectoryHash: 'ipfsDirectoryHash',
    }

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect prefix length',
      should: 'fail with error',
      actual: Try(() => poetAnchorToData({ ...poetAnchor, prefix: 'TOO_LONG' })),
      expected: new Error('Prefix should be a string of length 4'),
    })

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail with error',
      actual: Try(() => poetAnchorToData({ ...poetAnchor, version: [2, 3, 4] })),
      expected: new Error('Version should be an array of length 2'),
    })
  }
})

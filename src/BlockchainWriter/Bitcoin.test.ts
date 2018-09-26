import { StorageProtocol } from '@po.et/poet-js'
import { equals } from 'ramda'
import { describe, Try } from 'riteway'

import { poetAnchorToData } from './Bitcoin'

import { PREFIX_BARD, PREFIX_POET } from 'Helpers/Bitcoin'

describe('Bitcoin.getData', async should => {
  const { assert } = should()

  const testGetData = (prefix: string, version: ReadonlyArray<number>, protocol: StorageProtocol, message: string) => {
    const data = poetAnchorToData(prefix, version)(StorageProtocol.IPFS, message)
    const buffer = Buffer.from(data, 'hex')

    const given = 'a bitcoin-encoded Po.et data buffer'

    assert({
      given,
      should: 'match the prefix',
      actual: buffer.slice(0, 4).toString(),
      expected: prefix,
    })

    assert({
      given,
      should: 'match the version',
      actual: Array.from(buffer.slice(4, 6)),
      expected: version,
    })

    assert({
      given,
      should: 'match the storage protocol',
      actual: buffer.readInt8(6),
      expected: protocol,
    })

    assert({
      given,
      should: 'match the message',
      actual: buffer.slice(7).toString(),
      expected: message,
    })
  }

  testGetData(PREFIX_POET, [0, 2], StorageProtocol.IPFS, 'hello world')
  testGetData(PREFIX_BARD, [0, 3], StorageProtocol.IPFS, 'hello world 2')
  testGetData(PREFIX_BARD, [2, 1], StorageProtocol.IPFS, 'hello world')
  testGetData(PREFIX_BARD, [0, 2], StorageProtocol.IPFS, 'hello world 42')

  {
    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect prefix length',
      should: 'fail with error',
      actual: Try(() => poetAnchorToData('TOO_LONG', [2, 3])(StorageProtocol.IPFS, 'message')),
      expected: new Error(''),
    })

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail with error',
      actual: Try(() => poetAnchorToData(PREFIX_POET, [2, 3, 4])(StorageProtocol.IPFS, 'message')),
      expected: new Error(''),
    })
  }

})

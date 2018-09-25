import { equals } from 'ramda'
import { describe } from 'riteway'

import { getData } from './Bitcoin'

import { PREFIX_POET, PREFIX_BARD } from 'Helpers/Bitcoin'

describe('Bitcoin.getData', async should => {
  const { assert } = should()

  const testGetData = (prefix: string, version: ReadonlyArray<number>, message: string) => {
    const data = getData(prefix, version)(message)
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
      actual: Array.from(buffer.slice(4, 8)),
      expected: version,
    })

    assert({
      given,
      should: 'match the message',
      actual: buffer.slice(8).toString(),
      expected: message,
    })
  }

  testGetData(PREFIX_POET, [0, 0, 0, 2], 'hello world')
  testGetData(PREFIX_BARD, [0, 0, 0, 3], 'hello world 2')
  testGetData(PREFIX_BARD, [0, 0, 2, 1], 'hello world')
  testGetData(PREFIX_BARD, [0, 0, 0, 2], 'hello world 42')

  {
    const buffer = Buffer.from(getData(PREFIX_POET, [0, 1, 2, 3, 4])('message'), 'hex')

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'succeed to parse prefix',
      actual: buffer.slice(0, 4).toString(),
      expected: PREFIX_POET,
    })
    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail to parse version',
      actual: equals(Array.from(buffer.slice(4, 8)), [0, 1, 2, 3, 4]),
      expected: false,
    })
    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail to parse message',
      actual: equals(buffer.slice(8).toString(), 'message'),
      expected: false,
    })
  }
  {
    const buffer = Buffer.from(getData('POE', [0, 1, 2, 3])('message'), 'hex')

    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect prefix length',
      should: 'fail to parse prefix',
      actual: equals(buffer.slice(0, 4).toString(), PREFIX_POET),
      expected: false,
    })
    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail to parse version',
      actual: equals(Array.from(buffer.slice(4, 8)), [0, 1, 2, 3]),
      expected: false,
    })
    assert({
      given: 'a bitcoin-encoded Po.et data buffer with incorrect version length',
      should: 'fail to parse message',
      actual: equals(buffer.slice(8).toString(), 'message'),
      expected: false,
    })
  }
})

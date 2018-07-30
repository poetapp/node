import { describe } from 'riteway'

import { omitUndefined } from './OmitUndefined'

describe('omitUndefined()', async (should: any) => {
  const { assert } = should('')
  {
    const query = {}
    assert({
      given: 'empty object',
      should: 'return empty object',
      actual: omitUndefined(query),
      expected: query
    })
  }
  {
    const query: { publicKey: string, otherKey: string} = { publicKey: 'test', otherKey: 'test2' }
    assert({
      given: 'object with defined key value pairs',
      should: 'return correct object',
      actual: omitUndefined(query),
      expected: query
    })
  }
  {
    const query: { publicKey: string, badKey: any, otherKey: string } = { publicKey: 'test', badKey: undefined, otherKey: 'test2' }
    assert({
      given: 'object with defined keys and an undefined key',
      should: 'return an object with the defined keys',
      actual: omitUndefined(query),
      expected: { publicKey: 'test', otherKey: 'test2' }
    })
  }
})

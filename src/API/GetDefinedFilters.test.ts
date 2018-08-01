import { describe } from 'riteway'

import { getDefinedFilters } from './GetDefinedFilters'

describe('getDefinedFilters', async (should: any) => {
  const { assert } = should('')

  assert({
    given: 'empty object',
    should: 'return empty object',
    actual: getDefinedFilters({}),
    expected: {},
  })
  {
    const query = { publicKey: 'test' }
    assert({
      given: 'object with defined key value pairs',
      should: 'return object with same keys and values as input',
      actual: getDefinedFilters(query),
      expected: query,
    })
  }
  {
    const query: { publicKey: any } = { publicKey: undefined }
    assert({
      given: 'object with a single, undefined key',
      should: 'return empty object',
      actual: getDefinedFilters(query),
      expected: {},
    })
  }
  {
    const query: { publicKey: string; badKey: any } = { publicKey: 'test', badKey: 'ajsdfasdf' }
    assert({
      given: 'object with a accepted key and an unwanted key',
      should: 'return an object with the accepted key only',
      actual: getDefinedFilters(query),
      expected: { publicKey: 'test' },
    })
  }
})

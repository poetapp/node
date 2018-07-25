import { describe } from 'riteway'

import { getDefinedFilters } from './getDefinedFilters'

describe('RequestValidationMiddleware', async (should: any) => {
  const { assert } = should('')

    assert({
      given: 'empty object',
      should: 'return empty object',
      actual: getDefinedFilters({}),
      expected: {}
    })

    {
      const query = { publicKey: 'test' }
      assert({
      given: 'object with defined key value pairs',
      should: 'return correct object',
      actual: getDefinedFilters(query),
      expected: query
    })
  }

  {
    const query: { publicKey: any } = { publicKey: undefined }
    assert({
      given: 'object with an undefined key',
      should: 'return empty object',
      actual: getDefinedFilters(query),
      expected: {}
    })
  }

  {
    const query: { publicKey: string, badKey: any } = { publicKey: 'test', badKey: undefined }
    assert({
      given: 'object with an undefined key',
      should: 'return empty object',
      actual: getDefinedFilters(query),
      expected: { publicKey: 'test' }
    })
  }
})
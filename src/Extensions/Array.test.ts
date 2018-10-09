import { describe } from 'riteway'
import './Array'

describe('Array', async () => {
  describe('Array.toObject', async (assert: any) => {
    const arrayWithObject = [['key1', 'value1'], ['key2', 'value2']]

    const result = arrayWithObject.toObject()

    assert({
      given: 'array with two pairs of key values',
      should: 'transform to an object',
      actual: typeof result === 'object',
      expected: true,
    })

    assert({
      given: 'array with two pairs of key values',
      should: 'get the keys of new object transformed',
      actual: Object.keys(result),
      expected: ['key1', 'key2'],
    })

    assert({
      given: 'array with two pairs of key values',
      should: 'get the values of new object transformed',
      actual: Object.values(result),
      expected: ['value1', 'value2'],
    })
  })
})

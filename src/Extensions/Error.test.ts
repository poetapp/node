import { describe } from 'riteway'
import './Error'

describe('Extensions Error', async (should: any) => {
  const { assert } = should('')

  {
    const customError = new Error('error')
    const actual = JSON.parse(JSON.stringify(customError))

    assert({
      given: 'a new Error',
      should: 'transform to an valid object',
      actual: typeof actual === 'object',
      expected: true
    })

    assert({
      given: 'a new Error',
      should: 'get the keys of the new Error',
      actual: Object.keys(actual),
      expected: ['stack', 'message', 'type']
    })
  }
})

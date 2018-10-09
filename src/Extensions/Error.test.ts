import { describe } from 'riteway'
import './Error'

describe('Extensions Error', async (assert: any) => {
  {
    const customError = new Error('error')
    const actual = JSON.parse(JSON.stringify(customError))

    assert({
      given: 'a new Error',
      should: 'transform to an valid object',
      actual: typeof actual === 'object',
      expected: true,
    })

    assert({
      given: 'a new Error',
      should: 'get the keys of the new Error',
      actual: Object.keys(actual),
      expected: ['stack', 'message', 'type'],
    })

    assert({
      given: 'a new Error',
      should: 'be the type property a string with the value Error',
      actual: actual.type === 'Error',
      expected: true,
    })

    assert({
      given: 'a new Error',
      should: 'be the stack property a array',
      actual: Array.isArray(actual.stack),
      expected: true,
    })

    assert({
      given: 'a new Error',
      should: 'be the stack property a array with strings inside',
      actual: typeof actual.stack[0] === 'string',
      expected: true,
    })
  }

  {
    class CustomError extends Error {
      readonly type: string

      constructor() {
        super()
        this.type = 'CustomType'
      }
    }

    const customError = new CustomError()
    const actual = JSON.parse(JSON.stringify(customError))

    assert({
      given: 'a custom Error with type CustomType',
      should: 'be the type property CustomType',
      actual: actual.type === 'CustomType',
      expected: true,
    })
  }
})

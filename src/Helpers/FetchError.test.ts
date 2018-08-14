import { describe } from 'riteway'
import { isFetchError, isFetchTimeoutError } from './FetchError'

class FetchError extends Error {
  constructor() {
    super()
    this.name = 'FetchError'
  }
}

class FetchTimeoutError extends Error {
  readonly type: string

  constructor(type: string) {
    super()
    this.name = 'FetchError'
    this.type = type
  }
}

describe('FetchError', async (should: any) => {
  const { assert } = should('')

  describe('isFetchError', async (should: any) => {
    {
      const fetchError = new FetchError()
      const actual = isFetchError(fetchError)
      assert({
        given: 'a FetchError',
        should: 'isFetchError return true',
        actual,
        expected: true,
      })
    }

    {
      const error = new Error()
      const actual = isFetchError(error)
      assert({
        given: 'a custom Error',
        should: 'isFetchError return false',
        actual,
        expected: false,
      })
    }
  })

  describe('isFetchTimeoutError', async (should: any) => {
    {
      const fetchError = new FetchTimeoutError('request-timeout')
      const actual = isFetchTimeoutError(fetchError)
      assert({
        given: 'a FetchTimeoutError with type request-timeout',
        should: 'isFetchTimeoutError return true',
        actual,
        expected: true,
      })
    }

    {
      const fetchError = new FetchTimeoutError('body-timeout')
      const actual = isFetchTimeoutError(fetchError)
      assert({
        given: 'a FetchTimeoutError with type body-timeout',
        should: 'isFetchTimeoutError return true',
        actual,
        expected: true,
      })
    }

    {
      const fetchError = new FetchTimeoutError('any')
      const actual = isFetchTimeoutError(fetchError)
      assert({
        given: 'a FetchTimeoutError with type any',
        should: 'isFetchTimeoutError return false',
        actual,
        expected: false,
      })
    }

    {
      const error = new Error()
      const actual = isFetchTimeoutError(error)
      assert({
        given: 'a custom Error',
        should: 'isFetchError return false',
        actual,
        expected: false,
      })
    }
  })
})

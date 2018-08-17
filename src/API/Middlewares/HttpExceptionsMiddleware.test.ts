import { IllegalArgumentException, NotFoundException } from '@po.et/poet-js'
import { describe } from 'riteway'
import { spy } from 'sinon'
import { getCodeError, HttpExceptionsMiddleware, executeLogger } from './HttpExceptionsMiddleware'

describe('HttpExceptionsMiddleware', async (should: any) => {
  describe('HttpExceptionsMiddleware middleware', async (should: any) => {
    const { assert } = should('')
    {
      const ctx = {}
      const next = spy()
      await HttpExceptionsMiddleware(ctx, next)

      assert({
        given: 'no errors',
        should: 'call next once',
        actual: next.calledOnce,
        expected: true,
      })
    }

    {
      const ctx = { status: 0, body: '' }
      const next = () => Promise.reject(new Error('Something happened!'))

      await HttpExceptionsMiddleware(ctx, next).catch()

      assert({
        given: 'an error',
        should: 'return context with status 503 and the text Something happened!',
        actual: ctx.status === 503 && ctx.body === 'Something happened!',
        expected: true,
      })
    }
  })

  describe('getCodeError', async (should: any) => {
    const { assert } = should('')

    {
      const illegalArgumentException = new IllegalArgumentException('IllegalArgumentException')
      const actual = getCodeError(illegalArgumentException)

      assert({
        given: 'a IllegalArgumentException error',
        should: 'return status with 422 and body with IllegalArgumentException',
        actual: actual.status === 422 && actual.body === 'IllegalArgumentException',
        expected: true,
      })
    }

    {
      const notFoundException = new NotFoundException('NotFoundException')
      const actual = getCodeError(notFoundException)

      assert({
        given: 'a NotFoundException error',
        should: 'return status with 404 and body with NotFoundException',
        actual: actual.status === 404 && actual.body === 'NotFoundException',
        expected: true,
      })
    }

    {
      const actual = getCodeError(new Error('Error'))

      assert({
        given: 'any kind of Error distinct to IllegalArgumentException or NotFoundException',
        should: 'return status with 503 and body with Error',
        actual: actual.status === 503 && actual.body === 'Error',
        expected: true,
      })
    }
  })

  describe('getCodeError', async (should: any) => {
    const { assert } = should('')
    {
      const context = { logger: { error: spy() } }
      const exception = new Error()
      const status = 200

      executeLogger(context, exception, status)

      assert({
        given: 'an error status equals to 200',
        should: 'call once logger.error',
        actual: context.logger.error.calledOnce,
        expected: true,
      })
    }
  })
})

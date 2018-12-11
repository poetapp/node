import { IllegalArgumentException, NotFoundException } from '@po.et/poet-js'
import { always } from 'ramda'
import { describe } from 'riteway'
import { spy } from 'sinon'
import { getCodeError, HttpExceptionsMiddleware, executeLogger } from './HttpExceptionsMiddleware'

const app = { emit: always(undefined) }

describe('HttpExceptionsMiddleware middleware', async (assert) => {
  {
    const ctx: any = { app }
    const next = spy()
    await HttpExceptionsMiddleware(ctx, next)

    const actual = ctx
    const expected = ctx

    assert({
      given: 'no errors',
      should: 'the ctx keep without changes',
      actual,
      expected,
    })
  }

  {
    const ctx: any = { status: 0, body: '', app }
    const next = () => Promise.reject(new Error('Something happened!'))

    await HttpExceptionsMiddleware(ctx, next).catch()

    const actual = { status: ctx.status, body: ctx.body }
    const expected = { status: 503, body: 'Something happened!' }

    assert({
      given: 'an error',
      should: 'return context with status 503 and the text Something happened!',
      actual,
      expected,
    })
  }
})

describe('HttpExceptionsMiddleware getCodeError()', async (assert) => {

  {
    const illegalArgumentException = new IllegalArgumentException('IllegalArgumentException')
    const actual = getCodeError(illegalArgumentException)
    const expected = { status: 422, body: 'IllegalArgumentException' }

    assert({
      given: 'a IllegalArgumentException error',
      should: 'return status with 422 and body with IllegalArgumentException',
      actual,
      expected,
    })
  }

  {
    const notFoundException = new NotFoundException('NotFoundException')
    const actual = getCodeError(notFoundException)
    const expected = { status: 404, body: 'NotFoundException' }

    assert({
      given: 'a NotFoundException error',
      should: 'return status with 404 and body with NotFoundException',
      actual,
      expected,
    })
  }

  {
    const actual = getCodeError(new Error('Error'))
    const expected = { status: 503, body: 'Error' }

    assert({
      given: 'any kind of Error distinct to IllegalArgumentException or NotFoundException',
      should: 'return status with 503 and body with Error',
      actual,
      expected,
    })
  }
})

describe('HttpExceptionsMiddleware executeLogger()', async (assert) => {
  {
    const context = { logger: { error: spy() }, app }
    const exception = new Error()

    executeLogger(context, exception)

    assert({
      given: 'an error status equals to 200',
      should: 'call once logger.error',
      actual: context.logger.error.calledOnce,
      expected: true,
    })
  }
})

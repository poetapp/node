import * as Joi from 'joi'
import { describe } from 'riteway'
import { spy } from 'sinon'

import { RequestValidationMiddleware } from './RequestValidationMiddleware'

describe('ValidateMiddleware', async (should: any) => {
  const { assert } = should('')

  const name = 'Jon Doe'

  const schema = () => ({
    name: Joi.string(),
  })

  const invalidSchema = () => ({
    name: Joi.number(),
  })

  const ctx = {
    query: { name },
    params: { name },
    request: { body: { name } },
  }

  {
    const next = spy()

    await RequestValidationMiddleware({ body: schema })(ctx, next)

    assert({
      given: 'valid schema for validating body request',
      should: 'called next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()

    await RequestValidationMiddleware({ query: schema })(ctx, next)

    assert({
      given: 'valid schema for validating query request',
      should: 'called next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()

    await RequestValidationMiddleware({ params: schema })(ctx, next)

    assert({
      given: 'valid schema for validating params request',
      should: 'called next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()

    await RequestValidationMiddleware({ body: schema, query: schema, params: schema })(ctx, next)

    assert({
      given: 'valid schema for validating body, params and query request together',
      should: 'called next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()
    const throwSpy = spy()
    const context = { ...ctx, ...{ throw: throwSpy } }

    await RequestValidationMiddleware({ body: invalidSchema })(context, next)

    assert({
      given: 'invalid schema for validating body request',
      should: 'called throw',
      actual: context.throw.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()
    const throwSpy = spy()
    const context = { ...ctx, ...{ throw: throwSpy } }

    await RequestValidationMiddleware({ params: invalidSchema })(context, next)

    assert({
      given: 'invalid schema for validating params request',
      should: 'called throw',
      actual: context.throw.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()
    const throwSpy = spy()
    const context = { ...ctx, ...{ throw: throwSpy } }

    await RequestValidationMiddleware({ query: invalidSchema })(context, next)

    assert({
      given: 'invalid schema for validating query request',
      should: 'called throw',
      actual: context.throw.calledOnce,
      expected: true,
    })
  }
})
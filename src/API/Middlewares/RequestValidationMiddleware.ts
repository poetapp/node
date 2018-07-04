import { IllegalArgumentException } from '@po.et/poet-js'
import * as Joi from 'joi'

interface RequestValidationParams {
  readonly query?: (queryRequestValues: object) => {}
  readonly body?: (bodyRequestValues: object) => {}
  readonly params?: (paramsRequestValues: object) => {}
  readonly options?: object
}

export const RequestValidationMiddleware = (requestValidationParams: RequestValidationParams) => async (
  context: any,
  next: () => Promise<any>
) => {
  try {
    const { query, body, params, options } = requestValidationParams
    /* tslint:disable:no-unused-expression */
    body && (await Joi.validate(context.request.body, body(context.request.body), options))
    query && (await Joi.validate(context.query, query(context.query), options))
    params && (await Joi.validate(context.params, params(context.params), options))
    return next()
  } catch (exception) {
    if (context.logger)
      context.logger.debug({ exception }, 'Error Caught at Middleware - RequestValidationMiddleware rejected a request')

    throw new IllegalArgumentException(exception.message)
  }
}

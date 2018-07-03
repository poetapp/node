import * as Joi from 'joi'
import { IllegalArgumentException } from '@po.et/poet-js'
interface RequestValidationParams {
  readonly query?: (values: object) => {}
  readonly body?: (values: object) => {}
  readonly params?: (values: object) => {}
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
      context.logger.error({ exception }, 'Error Caught at Middleware - Will Return Internal Server Error')

    throw new IllegalArgumentException(exception)
  }
}

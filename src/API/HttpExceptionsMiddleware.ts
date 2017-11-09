import * as Koa from 'koa'

import { IllegalArgumentException } from '../Exceptions/index'

export const HttpExceptionsMiddleware: Koa.Middleware = async (context: any, next: () => Promise<any>) => {
  try {
    await next()
  } catch (exception) {
    if (exception instanceof IllegalArgumentException) {
      context.body = exception.message
      context.status = 422
    }
  }
}

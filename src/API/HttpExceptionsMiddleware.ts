import * as Koa from 'koa'

import { IllegalArgumentException, NotFoundException } from './Exceptions'

export const HttpExceptionsMiddleware: Koa.Middleware = async (context: any, next: () => Promise<any>) => {
  try {
    await next()
  } catch (exception) {
    if (exception instanceof IllegalArgumentException) {
      context.body = exception.message
      context.status = 422
    } else if (exception instanceof NotFoundException) {
      context.body = exception.message
      context.status = 404
    } else {
      console.log('Unexpected Error', exception)
      context.body =  'Internal Server Error'
      context.status = 503
    }
  }
}

import * as Koa from 'koa'

import { IllegalArgumentException, NotFoundException } from '@po.et/poet-js'

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
      if (context.logger)
        context.logger.error({ exception }, 'Error Caught at Middleware')

      if (exception.expose) {
        context.body = exception.message || 'Internal Server Error'
        context.status = exception.status || 503
      } else {
        context.body = 'Internal Server Error'
        context.status = 503
      }

      context.app.emit('error', exception, context)
    }
  }
}

import * as Koa from 'koa'
import * as Pino from 'pino'

export const LoggerMiddleware: (logger: Pino.Logger) => Koa.Middleware = (
  logger: Pino.Logger
) => async (context: any, next: () => Promise<any>) => {
  context.logger = logger
  await next()
}

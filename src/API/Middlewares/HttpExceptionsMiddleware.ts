import { IllegalArgumentException, NotFoundException } from '@po.et/poet-js'
import * as Koa from 'koa'
import { cond, T } from 'ramda'

export const HttpExceptionsMiddleware: Koa.Middleware = async (context: any, next: () => Promise<any>) => {
  try {
    await next()
  } catch (exception) {
    const { body, status } = getCodeError(exception)
    context.body = body
    context.status = status

    context.app.emit('error', exception, context)
    executeLogger(context, exception)
  }
}

export const executeLogger = (context: any, exception: Error) => {
  if (context.logger && isUnexpectedErrorStatusCode(context.status))
    context.logger.error({ exception }, 'Error Caught at Middleware - Will Return Internal Server Error')
}

const isUnexpectedErrorStatusCode = (status: number) => status !== 422 && status !== 404
const isIllegalArgumentException = (exception: Error) => exception instanceof IllegalArgumentException
const isNotFoundException = (exception: Error) => exception instanceof NotFoundException

const getIllegalArgumentException = ({ message }: Error) => ({ status: 422, body: message })
const getNotFoundException = ({ message }: Error) => ({ status: 404, body: message })
const getDefaultException = ({ message }: Error) => ({ status: 503, body: message })

export const getCodeError = (exception: Error): { body: string; status: number } =>
  cond([
    [isIllegalArgumentException, getIllegalArgumentException],
    [isNotFoundException, getNotFoundException],
    [T, getDefaultException],
  ])(exception)

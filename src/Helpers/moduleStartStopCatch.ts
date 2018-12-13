import * as Pino from 'pino'

export const shutdownModule = (server: any) =>
  process.on('SIGINT', () => server.stop())

export const catchStartupError = (moduleName: string, logger: Pino.Logger) =>
    (exception: Error) => logger.error({ exception }, `unable to start ${moduleName}`)

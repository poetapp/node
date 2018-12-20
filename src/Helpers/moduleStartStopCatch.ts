import * as Pino from 'pino'

export const catchStartupError = (moduleName: string, logger: Pino.Logger) =>
    (exception: Error) => logger.fatal({ exception }, `Unable to start ${moduleName}`)

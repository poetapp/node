import { basename } from 'path'
import * as Pino from 'pino'

import { LoggingConfiguration } from 'Configuration'

export function createModuleLogger(
  configuration: LoggingConfiguration,
  dirname: string
): Pino.Logger {
  return childWithModuleName(
    Pino(loggingConfigurationToPinoConfiguration(configuration)),
    dirname
  )
}

export function childWithModuleName(logger: Pino.Logger, directory: string) {
  return logger.child({ module: basename(directory) })
}

export function childWithFileName(logger: Pino.Logger, file: string) {
  return logger.child({ file: basename(file).slice(0, -3) })
}

export const loggingConfigurationToPinoConfiguration = (
  configuration: LoggingConfiguration
) => ({
  level: configuration.loggingLevel,
  prettyPrint: configuration.loggingPretty
})

import { Interval } from '@po.et/poet-js'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

import { ClaimController } from './ClaimController'

export interface ServiceConfiguration {
  readonly downloadIntervalInSeconds: number
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly claimController: ClaimController
}

export interface Arguments {
  readonly dependencies: Dependencies,
  readonly configuration: ServiceConfiguration
}

export interface Service {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Service = ({
  dependencies: {
    logger,
    claimController,
  },
  configuration,
 }: Arguments): Service => {
  const serviceLogger = childWithFileName(logger, __filename)

  const downloadNextHash = async () => {
    try {
      await claimController.downloadNextHash()
    } catch (error) {
      serviceLogger.error(
        {
          method: 'downloadNextHash',
          error,
        },
        'Uncaught Error Downloading Next Hash',
      )
    }
  }

  const interval =  new Interval(downloadNextHash, 1000 * configuration.downloadIntervalInSeconds)

  const start = async () => {
    interval.start()
  }

  const stop = async () => {
    interval.stop()
  }

  return {
    start,
    stop,
  }
}

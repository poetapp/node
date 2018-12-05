import { Interval } from '@po.et/poet-js'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface Configuration {
  readonly uploadClaimIntervalInSeconds: number
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
}

export interface Arguments {
  readonly configuration: Configuration
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export interface Service {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Service = ({
  configuration,
  dependencies,
  exchange,
}: Arguments): Service => {
  const { messaging } = dependencies
  const logger = childWithFileName(dependencies.logger, __filename)

  const uploadNextClaim = async () => {
    const methodLogger = logger.child({ method: 'uploadNextClaim' })
    try {
      await messaging.publish(exchange.storageWriterStoreNextClaim, '')
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception in StorageWriter Service')
    }
  }

  const uploadNextClaimInterval = new Interval(
    uploadNextClaim,
    secondsToMiliseconds(configuration.uploadClaimIntervalInSeconds),
  )

  const start = async () => {
    await uploadNextClaimInterval.start()
  }

  const stop = async () => {
    await uploadNextClaimInterval.stop()
  }

  return {
    start,
    stop,
  }
}

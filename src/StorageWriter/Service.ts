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
  logger: Pino.Logger
  messaging: Messaging
}

export interface ServiceArg {
  configuration: Configuration
  dependencies: Dependencies
  exchange: ExchangeConfiguration 
}

export interface Service {
  start: () => Promise<void>
  stop: () => Promise<void>
}

export const Service = ({
  configuration,
  dependencies: {
    logger,
    messaging
  },
  // Instead of receiving exchange configuration, an exchange object
  // should be passed in that contains preconfigured functions to call.
  exchange
}: ServiceArg) => {
  const childLogger = childWithFileName(logger, __filename)

  
  const uploadNextClaim = async () => {
    const methodLogger = childLogger.child({ method: 'uploadNextClaim' })
    try {
      await messaging.publish(exchange.storageWriterStoreNextClaim, '')  
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception in StorageWriter Service')
    }
  }

  const uploadNextClaimInterval = new Interval(
    uploadNextClaim,
    secondsToMiliseconds(configuration.uploadClaimIntervalInSeconds)
  )

  
  const start = async () => {
    await uploadNextClaimInterval.start()
  }

  const stop = async () => {
    await uploadNextClaimInterval.stop()
  }

  return {
    start,
    stop
  }
}

import { Interval } from '@po.et/poet-js'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'

import { Controller } from './Controller'

export interface Configuration {
  readonly uploadAnchorReceiptIntervalInSeconds: number
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly controller: Controller
}

export interface Arguments {
  readonly configuration: Configuration
  readonly dependencies: Dependencies
}

export interface Service {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Service = ({
  configuration,
  dependencies: {
    logger: parentLogger,
    controller,
  },
}: Arguments): Service => {
  const logger = childWithFileName(parentLogger, __filename)

  const uploadNextAnchorReceipt = async () => {
    const methodLogger = logger.child({ method: 'uploadNextAnchorReceipt' })
    try {
      await controller.uploadNextAnchorReceipt()
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception')
    }
  }

  const uploadNextClaimInterval = new Interval(
    uploadNextAnchorReceipt,
    secondsToMiliseconds(configuration.uploadAnchorReceiptIntervalInSeconds),
  )

  const start = async () => {
    logger.info({ configuration }, 'EthereumRegistryWriter Service Starting')
    await uploadNextClaimInterval.start()
  }

  const stop = async () => {
    logger.info({ configuration }, 'EthereumRegistryWriter Service Stopping')
    await uploadNextClaimInterval.stop()
  }

  return {
    start,
    stop,
  }
}

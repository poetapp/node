import { Interval } from '@po.et/poet-js'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'

import { Controller } from './Controller'

export interface Configuration {
  readonly uploadAnchorReceiptIntervalInSeconds: number
  readonly registerNextDirectoryIntervalInSeconds: number
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly controller: Controller
}

export interface Arguments {
  readonly configuration: Configuration
  readonly dependencies: Dependencies
}

export interface Scheduler {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Scheduler = ({
  configuration,
  dependencies: {
    logger: parentLogger,
    controller,
  },
}: Arguments): Scheduler => {
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

  const registerNextDirectory = async () => {
    const methodLogger = logger.child({ method: 'registerNextDirectory' })
    try {
      await controller.registerNextDirectory()
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception')
    }
  }

  const registerNextDirectoryInterval = new Interval(
    registerNextDirectory,
    secondsToMiliseconds(configuration.registerNextDirectoryIntervalInSeconds),
  )

  const start = async () => {
    logger.info({ configuration }, 'EthereumRegistryWriter Scheduler Starting')
    await uploadNextClaimInterval.start()
    registerNextDirectoryInterval.start()
  }

  const stop = async () => {
    logger.info({ configuration }, 'EthereumRegistryWriter Scheduler Stopping')
    await uploadNextClaimInterval.stop()
    registerNextDirectoryInterval.stop()
  }

  return {
    start,
    stop,
  }
}

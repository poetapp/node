import { Interval } from '@po.et/poet-js'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'

import { Business } from './Business'

export interface Configuration {
  readonly uploadAnchorReceiptIntervalInSeconds: number
  readonly registerNextDirectoryIntervalInSeconds: number
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly business: Business
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
    business,
  },
}: Arguments): Scheduler => {
  const logger = childWithFileName(parentLogger, __filename)

  const uploadNextAnchorReceipt = async () => {
    const methodLogger = logger.child({ method: 'uploadNextAnchorReceipt' })
    try {
      await business.uploadNextAnchorReceipt()
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception')
    }
  }

  const uploadNextAnchorReceiptInterval = new Interval(
    uploadNextAnchorReceipt,
    secondsToMiliseconds(configuration.uploadAnchorReceiptIntervalInSeconds),
  )

  const uploadNextClaimFileAnchorReceiptPair = async () => {
    const methodLogger = logger.child({ method: 'uploadNextClaimFileAnchorReceiptPair' })
    try {
      await business.uploadNextClaimFileAnchorReceiptPair()
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception')
    }
  }

  const uploadNextClaimFileAnchorReceiptPairInterval = new Interval(
    uploadNextClaimFileAnchorReceiptPair,
    secondsToMiliseconds(configuration.uploadAnchorReceiptIntervalInSeconds),
  )

  const registerNextDirectory = async () => {
    const methodLogger = logger.child({ method: 'registerNextDirectory' })
    try {
      await business.registerNextDirectory()
    } catch (error) {
      methodLogger.error({ error }, 'Uncaught exception')
    }
  }

  const registerNextDirectoryInterval = new Interval(
    registerNextDirectory,
    secondsToMiliseconds(configuration.registerNextDirectoryIntervalInSeconds),
  )

  const start = async () => {
    logger.debug({ configuration }, 'EthereumRegistryWriter Scheduler Starting')
    await uploadNextAnchorReceiptInterval.start()
    await uploadNextClaimFileAnchorReceiptPairInterval.start()
    await registerNextDirectoryInterval.start()
    logger.info({ configuration }, 'EthereumRegistryWriter Scheduler Started')
  }

  const stop = async () => {
    logger.debug('EthereumRegistryWriter Scheduler Stopping')
    await uploadNextAnchorReceiptInterval.stop()
    await uploadNextClaimFileAnchorReceiptPairInterval.stop()
    await registerNextDirectoryInterval.stop()
    logger.info('EthereumRegistryWriter Scheduler Stopped')
  }

  return {
    start,
    stop,
  }
}

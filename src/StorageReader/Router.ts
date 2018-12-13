import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly claimController: ClaimController
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export interface Router {
  readonly start: () => Promise<void>
}

export const Router = ({
  dependencies: {
    logger,
    messaging,
    claimController,
  },
  exchange,
}: Arguments): Router => {
  const routerLogger = childWithFileName(logger, __filename)

  const start = async () => {
    await messaging.consume(
      exchange.batchReaderReadNextDirectorySuccess,
      onBatchReaderReadNextDirectorySuccess,
    )
  }

  const onBatchReaderReadNextDirectorySuccess = async (message: any): Promise<void> => {
    const logger = routerLogger.child({ method: 'onBatchReaderReadNextDirectorySuccess' })

    const messageContent = message.content.toString()
    const { ipfsFileHashes } = JSON.parse(messageContent)

    logger.trace({ ipfsFileHashes }, 'Downloading Claims from IPFS')

    try {
      await claimController.download(ipfsFileHashes)
    } catch (error) {
      logger.error({ error }, 'Error downloading IPFS hashes')
    }
  }

  return {
    start,
  }
}

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

export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: ClaimController
  private readonly exchange: ExchangeConfiguration

  constructor({
    dependencies: {
      logger,
      messaging,
      claimController,
    },
    exchange,
  }: Arguments) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
    this.exchange = exchange
  }

  async start() {
    await this.messaging.consume(
      this.exchange.batchReaderReadNextDirectorySuccess,
      this.onBatchReaderReadNextDirectorySuccess,
    )
  }

  onBatchReaderReadNextDirectorySuccess = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBatchReaderReadNextDirectorySuccess' })

    const messageContent = message.content.toString()
    const { ipfsFileHashes } = JSON.parse(messageContent)

    logger.trace({ ipfsFileHashes }, 'Downloading Claims from IPFS')

    try {
      await this.claimController.download(ipfsFileHashes)
    } catch (error) {
      logger.error({ error }, 'Error downloading IPFS hashes')
    }
  }
}

import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: ClaimController

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') claimController: ClaimController
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
  }

  async start() {
    await this.messaging.consume(Exchange.BatchWriterCreateNextBatchSuccess, this.onBatchWriterCreateNextBatchSuccess)
    await this.messaging.consume(Exchange.BlockchainWriterTimestampRequest, this.onBlockchainWriterTimestampRequest)
  }

  onBatchWriterCreateNextBatchSuccess = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBatchWriterCreateNextBatchSuccess' })
    const messageContent = message.content.toString()
    const { fileHashes, directoryHash } = JSON.parse(messageContent)
    try {
      if (fileHashes.length > 0)
        await this.messaging.publish(Exchange.BlockchainWriterTimestampRequest, { fileHashes, directoryHash })
    } catch (error) {
      logger.error('Failed to publish BlockchainWriterTimestampRequest')
    }
  }

  onBlockchainWriterTimestampRequest = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBlockchainWriterTimestampRequest' })

    const messageContent = message.content.toString()
    const { fileHashes, directoryHash } = JSON.parse(messageContent)

    logger.trace('Timestamp request', {
      fileHashes,
      directoryHash,
    })

    try {
      await this.createTimestampRequest({ fileHashes, directoryHash })
      logger.trace('Timestamp request success', { fileHashes, directoryHash })
    } catch (error) {
      logger.error('Timestamp request failure', {
        error,
        directoryHash,
        fileHashes,
      })
    }
  }
  createTimestampRequest = async ({
    fileHashes,
    directoryHash,
  }: {
    fileHashes: ReadonlyArray<string>
    directoryHash: string
  }): Promise<void> => {
    try {
      await this.claimController.requestTimestamp(directoryHash)
      await this.messaging.publish(Exchange.BlockchainWriterTimestampSuccess, { fileHashes, directoryHash })
    } catch (error) {
      await this.messaging.publish(Exchange.BlockchainWriterTimestampFailure, { error, fileHashes, directoryHash })
    }
  }
}

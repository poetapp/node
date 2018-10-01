import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { NoMoreEntriesException } from 'Exceptions'
import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: ClaimController
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') claimController: ClaimController,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
    this.exchange = exchange
  }

  async start() {
    await this.messaging.consume(this.exchange.claimIpfsHash, this.onClaimIPFSHash)
    await this.messaging.consume(
      this.exchange.batchWriterCreateNextBatchRequest,
      this.onBatchWriterCreateNextBatchRequest
    )
  }

  async stop() {
    this.logger.info('BatchWriter Router Stopping')
    this.logger.info('BatchWriter Router Messaging Stopping')
    await this.messaging.stop()
  }

  onClaimIPFSHash = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onClaimIPFSHash' })
    const messageContent = message.content.toString()
    const item = JSON.parse(messageContent)
    const ipfsFileHash = item.ipfsFileHash

    try {
      await this.claimController.addEntry({ ipfsFileHash })
    } catch (error) {
      logger.error(
        {
          ipfsFileHash,
          error,
        },
        'Uncaught Exception while adding item to be batched'
      )
    }
  }

  onBatchWriterCreateNextBatchRequest = async () => {
    const logger = this.logger.child({
      method: 'onBatchWriterCreateNextBatchRequest',
    })
    logger.trace('Create next batch request')
    try {
      const { ipfsFileHashes, ipfsDirectoryHash } = await this.claimController.createNextBatch()
      await this.messaging.publish(this.exchange.batchWriterCreateNextBatchSuccess, {
        ipfsFileHashes,
        ipfsDirectoryHash,
      })
      logger.info({ ipfsDirectoryHash }, 'Create next batch success')
    } catch (error) {
      if (error instanceof NoMoreEntriesException) logger.trace(error.message)
      else logger.error({ error }, 'Create next batch failure')
    }
  }
}

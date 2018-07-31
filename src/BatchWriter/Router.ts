import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { NoMoreEntriesException } from 'Exceptions'
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
    await this.messaging.consume(Exchange.ClaimIPFSHash, this.onClaimIPFSHash)
    await this.messaging.consume(Exchange.BatchWriterCreateNextBatchRequest, this.onBatchWriterCreateNextBatchRequest)
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
    const logger = this.logger.child({ method: 'onBatchWriterCreateNextBatchRequest' })
    logger.trace('Create next batch request')
    try {
      const { ipfsFileHashes, ipfsDirectoryHash } = await this.claimController.createNextBatch()
      await this.messaging.publish(Exchange.BatchWriterCreateNextBatchSuccess, { ipfsFileHashes, ipfsDirectoryHash })
      logger.info({ ipfsDirectoryHash }, 'Create next batch success')
    } catch (error) {
      if (error instanceof NoMoreEntriesException) logger.trace(error.message)
      else logger.error({ error }, 'Create next batch failure')
    }
  }
}

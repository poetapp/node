import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { Controller } from './Controller'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: Controller

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('Controller') claimController: Controller
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
  }

  async start() {
    await this.messaging.consume(
      Exchange.BatchWriterCreateNextBatchSuccess,
      this.onBlockchainWriterRequestTimestampRequest
    )
  }

  onBlockchainWriterRequestTimestampRequest = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBlockchainWriterRequestTimestampRequest' })

    const messageContent = message.content.toString()
    const { ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace(
      {
        ipfsDirectoryHash,
      },
      'creating timestamp request'
    )

    try {
      await this.claimController.requestTimestamp(ipfsDirectoryHash)
      logger.trace({ ipfsDirectoryHash }, 'Timestamp request created')
    } catch (error) {
      logger.error(
        {
          error,
          ipfsDirectoryHash,
        },
        'Timestamp request failure'
      )
    }
  }
}

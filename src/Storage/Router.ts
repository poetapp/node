import { isClaim } from '@po.et/poet-js'
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
    await this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
    await this.messaging.consume(
      Exchange.BatchReaderReadNextDirectorySuccess,
      this.onBatchReaderReadNextDirectorySuccess
    )
  }

  onNewClaim = async (message: any): Promise<void> => {
    const messageContent = message.content.toString()

    const claim = JSON.parse(messageContent)

    if (!isClaim(claim)) throw new Error(`Received a ${Exchange.NewClaim} message, but the content isn't a claim.`)

    try {
      await this.claimController.create(claim)
    } catch (error) {
      this.logger.error(
        {
          method: 'onNewClaim',
          error,
        },
        'Uncaught Exception while Storing Claim'
      )
    }
  }

  onBatchReaderReadNextDirectorySuccess = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onPoetTimestampsDownloaded' })

    const messageContent = message.content.toString()
    const { fileHashes } = JSON.parse(messageContent)

    logger.trace({ fileHashes }, 'Downloading Claims from IPFS')

    try {
      await this.claimController.download(fileHashes)
    } catch (error) {
      logger.error({ error }, 'Error downloading IPFS hashes')
    }
  }
}

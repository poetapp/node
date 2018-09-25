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
    await this.messaging.consume(
      Exchange.BatchReaderReadNextDirectorySuccess,
      this.onBatchReaderReadNextDirectorySuccess
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

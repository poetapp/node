import { PoetBlockAnchor } from '@po.et/poet-js'
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
    await this.messaging.consumeBlockAnchorsDownloaded(this.onPoetBlockAnchorsDownloaded)
    await this.messaging.consume(
      Exchange.BatchReaderReadNextDirectoryRequest,
      this.onBatchReaderReadNextDirectoryRequest
    )
  }

  async stop() {
    this.logger.info('Stopping BatchReader Router...')
    this.logger.info('Stopping BatchReader Messaging...')
    await this.messaging.stop()
  }

  onPoetBlockAnchorsDownloaded = async (poetAnchors: ReadonlyArray<PoetBlockAnchor>): Promise<void> => {
    const logger = this.logger.child({ method: 'onPoetBlockAnchorsDownloaded' })

    logger.trace(
      {
        poetAnchors,
      },
      'Storing directory hashes from PoetBlockAnchors'
    )

    try {
      await this.claimController.addEntries(poetAnchors)
    } catch (error) {
      logger.error({ error, poetAnchors }, 'Failed to store directory hashes to DB collection')
    }
  }

  onBatchReaderReadNextDirectoryRequest = async () => {
    const logger = this.logger.child({
      method: 'onBatchReaderReadNextDirectoryRequest',
    })
    logger.trace('Read next directory request')
    try {
      const result = await this.claimController.readNextDirectory()
      if (!result) return
      const { ipfsFileHashes, ipfsDirectoryHash } = result
      await this.messaging.publish(Exchange.BatchReaderReadNextDirectorySuccess, { ipfsDirectoryHash, ipfsFileHashes })
      logger.info({ ipfsDirectoryHash, ipfsFileHashes }, 'Read next directory success')
    } catch (error) {
      logger.error({ error }, 'Read next directory failure')
    }
  }
}

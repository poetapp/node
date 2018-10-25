import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { BlockDownloaded } from 'Messaging/Messages'
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
    await this.messaging.consumeBlockDownloaded(this.onPoetBlockAnchorsDownloaded)

    await this.messaging.consume(
      this.exchange.batchReaderReadNextDirectoryRequest,
      this.onBatchReaderReadNextDirectoryRequest
    )
  }

  async stop() {
    this.logger.info('Stopping BatchReader Router...')
    this.logger.info('Stopping BatchReader Messaging...')
    await this.messaging.stop()
  }

  onPoetBlockAnchorsDownloaded = async (blockDownloaded: BlockDownloaded): Promise<void> => {
    const logger = this.logger.child({ method: 'onPoetBlockAnchorsDownloaded' })

    const { poetBlockAnchors } = blockDownloaded

    logger.trace(
      {
        blockDownloaded,
      },
      'Storing directory hashes from PoetBlockAnchors'
    )

    try {
      await this.claimController.addEntries(poetBlockAnchors)
    } catch (error) {
      logger.error({ error, poetBlockAnchors }, 'Failed to store directory hashes to DB collection')
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
      await this.messaging.publish(this.exchange.batchReaderReadNextDirectorySuccess, {
        ipfsDirectoryHash,
        ipfsFileHashes,
      })
      logger.info({ ipfsDirectoryHash, ipfsFileHashes }, 'Read next directory success')
    } catch (error) {
      logger.error({ error }, 'Read next directory failure')
    }
  }
}

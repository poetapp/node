import { PoetBlockAnchor } from '@po.et/poet-js'
import * as Pino from 'pino'
import { pluck } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { BlockDownloaded } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { Controller } from './Controller'
import { ExchangeConfiguration } from './ExchangeConfiguration'

const getTxnIds = pluck('transactionId')

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly claimController: Controller
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: Controller
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
    await this.messaging.consume(this.exchange.anchorNextHashRequest, this.onAnchorNextHashRequest)
    await this.messaging.consume(this.exchange.batchWriterCreateNextBatchSuccess, this.onCreateBatchSuccess)
    await this.messaging.consumeBlockDownloaded(this.blockDownloadedConsumer)
    await this.messaging.consume(this.exchange.purgeStaleTransactions, this.onPurgeStaleTransactions)
  }

  onAnchorNextHashRequest = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onAnchorNextHashRequest' })

    logger.trace('Anchoring next hash')

    try {
      await this.claimController.anchorNextIPFSDirectoryHash()
      logger.trace('Anchored next hash')
    } catch (error) {
      logger.error({ error }, 'Anchoring next hash failed')
    }
  }

  blockDownloadedConsumer = async (blockDownloaded: BlockDownloaded): Promise<void> =>
    this.claimController.setBlockInformationForTransactions(
      getTxnIds(blockDownloaded.poetBlockAnchors),
      blockDownloaded.block,
    )

  onPurgeStaleTransactions = async (): Promise<void> => {
    const logger = this.logger.child({ method: 'onPurgeStaleTransactions' })

    try {
      await this.claimController.purgeStaleTransactions()
    } catch (error) {
      logger.trace(
        { error },
        'Error encountered while purging stale transactions',
      )
    }
  }

  onCreateBatchSuccess = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onCreateBatchSuccess' })

    const messageContent = message.content.toString()
    const { ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace(
      {
        ipfsDirectoryHash,
      },
      'Creating anchor request',
    )

    try {
      await this.claimController.requestAnchor(ipfsDirectoryHash)
      logger.trace({ ipfsDirectoryHash }, 'Anchor request created')
    } catch (error) {
      logger.error(
        {
          error,
          ipfsDirectoryHash,
        },
        'Anchor request failure',
      )
    }
  }
}

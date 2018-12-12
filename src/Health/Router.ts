import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { IPFSHashFailure } from 'Interfaces'
import { BlockDownloaded, IPFSHashTxId } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { HealthController } from './HealthController'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly controller: HealthController
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly controller: HealthController
  private readonly exchange: ExchangeConfiguration

  constructor({
    dependencies: {
      logger,
      messaging,
      controller,
    },
    exchange,
  }: Arguments) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.controller = controller
    this.exchange = exchange
  }

  async start() {
    await this.messaging.consume(this.exchange.getHealth, this.onGetHealth)
    await this.messaging.consumeClaimsNotDownloaded(this.onClaimsNotDownloaded)
    await this.messaging.consumeBlockDownloaded(this.blockDownloadedConsumer)
  }

  onGetHealth = async () => {
    const logger = this.logger.child({ method: 'onGetHealth' })
    try {
      await this.controller.refreshWalletInfo()
      await this.controller.refreshBlockchainInfo()
      await this.controller.refreshNetworkInfo()
      await this.controller.refreshIPFSInfo()
      await this.controller.refreshEstimatedSmartFee()
      await this.controller.refreshTransactionAnchorRetryInfo()
    } catch (error) {
      logger.error({ error }, 'Failed to getHealthInfo')
    }
  }

  onClaimsNotDownloaded = async (ipfsHashFailures: ReadonlyArray<IPFSHashFailure>) => {
    const logger = this.logger.child({ method: 'onClaimsNotDownloaded' })

    logger.trace({ ipfsHashFailures }, 'IPFS Download Failure, updating IFPS Failure count')
    try {
      await this.controller.updateIPFSFailures(ipfsHashFailures)
    } catch (error) {
      logger.error({ error }, 'Failed to update ipfsHashFailures on health')
    }
  }

  blockDownloadedConsumer = async (blockDownloaded: BlockDownloaded): Promise<void> => {
    const logger = this.logger.child({ method: 'blockDownloadedConsumer' })

    logger.debug({ blockDownloaded }, 'Block downloaded, removing associated transactions')
    try {
      const transactionIds = blockDownloaded.poetBlockAnchors.map(_ => _.transactionId)
      await this.controller.purgeIpfsDirectoryHashByTransactionIds(transactionIds)
    } catch (error) {
      logger.error({ error }, 'Failed to remove transactions')
    }
  }
}

import BitcoinCore = require('bitcoin-core')
import { Collection, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'
import { bitcoinRPCConfigurationToBitcoinCoreArguments } from 'Helpers/Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { Controller, ControllerConfiguration } from './Controller'
import { DAO } from './DAO'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

export interface BlockchainWriterConfiguration
  extends LoggingConfiguration,
    ControllerConfiguration,
    ServiceConfiguration,
    BitcoinRPCConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class BlockchainWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BlockchainWriterConfiguration
  private mongoClient: MongoClient
  private messaging: Messaging
  private service: Service

  constructor(configuration: BlockchainWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BlockchainWriter Starting')

    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    const db = await this.mongoClient.db()

    const blockchainWriterCollection: Collection = db.collection('blockchainWriter')

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], this.configuration.exchanges)

    this.messaging = new Messaging(
      this.configuration.rabbitmqUrl,
      exchangesMessaging,
    )
    await this.messaging.start()

    const dao = new DAO({
      dependencies: {
        blockchainWriterCollection,
      },
    })
    await dao.start()

    const bitcoinCore = new BitcoinCore(
      bitcoinRPCConfigurationToBitcoinCoreArguments(this.configuration),
    )

    const controller = new Controller({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
        bitcoinCore,
        dao,
      },
      configuration: this.configuration,
      exchange: this.configuration.exchanges,
    })

    const router = new Router({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
        claimController: controller,
      },
      exchange: this.configuration.exchanges,
    })
    await router.start()

    this.service = new Service({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
      },
      configuration: {
        anchorIntervalInSeconds: this.configuration.anchorIntervalInSeconds,
        purgeStaleTransactionsIntervalInSeconds: this.configuration.purgeStaleTransactionsIntervalInSeconds,
        maximumTransactionAgeInBlocks: this.configuration.maximumTransactionAgeInBlocks,
      },
      exchange: this.configuration.exchanges,
    })
    await this.service.start()

    this.logger.info('BlockchainWriter Started')
  }

  async stop() {
    this.logger.info('BlockchainWriter stopping...')
    this.logger.info('BlockchainWriter Database stopping...')
    await this.mongoClient.close()
    await this.service.stop()
    this.logger.info('BlockchainWriter Messaging stopping...')
    await this.messaging.stop()
  }
}

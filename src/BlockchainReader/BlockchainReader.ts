import BitcoinCore = require('bitcoin-core')
import { MongoClient, Db, Collection } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'

import { Controller, ControllerConfiguration } from './Controller'
import { DAO } from './DAO'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Service, ServiceConfiguration } from './Service'

export interface BlockchainReaderConfiguration
  extends LoggingConfiguration,
    ControllerConfiguration,
    ServiceConfiguration,
    BitcoinRPCConfiguration {
  readonly rabbitmqUrl: string
  readonly dbUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class BlockchainReader {
  private readonly logger: Pino.Logger
  private readonly configuration: BlockchainReaderConfiguration
  private mongoClient: MongoClient
  private dbConnection: Db
  private messaging: Messaging
  private service: Service

  constructor(configuration: BlockchainReaderConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BlockchainReader Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    const exchanges = ['poetAnchorDownloaded', 'claimsDownloaded', 'forkDetected']
    const exchangesMessaging = pick(exchanges, this.configuration.exchanges)
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    const collection: Collection = this.dbConnection.collection('blockchainReader')

    const dao = new DAO({
      dependencies: {
        collection,
      },
    })
    await dao.start()

    const bitcoinCore = new BitcoinCore({
      host: this.configuration.bitcoinUrl,
      port: this.configuration.bitcoinPort,
      network: this.configuration.bitcoinNetwork,
      username: this.configuration.bitcoinUsername,
      password: this.configuration.bitcoinPassword,
    })

    const controller = new Controller({
      dependencies: {
        logger: this.logger,
        dao,
        messaging: this.messaging,
        bitcoinCore,
      },
      configuration: this.configuration,
    })

    this.service = new Service({
      dependencies: {
        logger: this.logger,
        claimController: controller,
      },
      configuration: {
        minimumBlockHeight: this.configuration.minimumBlockHeight,
        blockchainReaderIntervalInSeconds: this.configuration.blockchainReaderIntervalInSeconds,
        forceBlockHeight: this.configuration.forceBlockHeight,
      },
    })
    await this.service.start()

    this.logger.info('BlockchainReader Started')
  }

  async stop() {
    this.logger.info('BlockchainReader Stopping...')
    this.logger.info('BlockchainReader Database Stopping...')
    await this.mongoClient.close()
    this.service.stop()
    this.logger.info('BlockchainReader Messaging Stopping...')
    await this.messaging.stop()
  }
}

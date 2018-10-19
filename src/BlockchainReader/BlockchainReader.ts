import BitcoinCore = require('bitcoin-core')
import { injectable, Container } from 'inversify'
import { MongoClient, Db } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'

import { Controller, ControllerConfiguration } from './Controller'
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

@injectable()
export class BlockchainReader {
  private readonly logger: Pino.Logger
  private readonly configuration: BlockchainReaderConfiguration
  private readonly container = new Container()
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

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], this.configuration.exchanges)
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    this.initializeContainer()

    this.service = this.container.get('Service')
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

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Controller>('ClaimController').to(Controller)
    this.container.bind<Service>('Service').to(Service)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<BitcoinCore>('BitcoinCore').toConstantValue(
      new BitcoinCore({
        host: this.configuration.bitcoinUrl,
        port: this.configuration.bitcoinPort,
        network: this.configuration.bitcoinNetwork,
        username: this.configuration.bitcoinUsername,
        password: this.configuration.bitcoinPassword,
      })
    )
    this.container.bind<ControllerConfiguration>('ClaimControllerConfiguration').toConstantValue(this.configuration)
    this.container.bind<ServiceConfiguration>('ServiceConfiguration').toConstantValue({
      minimumBlockHeight: this.configuration.minimumBlockHeight,
      blockchainReaderIntervalInSeconds: this.configuration.blockchainReaderIntervalInSeconds,
      forceBlockHeight: this.configuration.forceBlockHeight,
    })
  }
}

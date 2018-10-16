import BitcoinCore = require('bitcoin-core')
import { Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { LoggingConfiguration, BitcoinRPCConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'

import { HealthController } from './HealthController'
import { HealthService, HealthServiceConfiguration } from './HealthService'
import { IPFS, IPFSConfiguration } from './IPFS'


export interface HealthConfiguration extends LoggingConfiguration, BitcoinRPCConfiguration, HealthServiceConfiguration, IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

export class Health {
  private readonly logger: Pino.Logger
  private readonly configuration: HealthConfiguration
  private readonly container = new Container()
  private mongoClient: MongoClient
  private dbConnection: Db
  private cron: HealthService

  constructor(configuration: HealthConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'Health Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    this.initializeContainer()

    this.cron = this.container.get('Cron')
    await this.cron.start()

    this.logger.info('Health Started')
  }

  async stop() {
    this.logger.info('Stopping Health...')
    await this.cron.stop()
    this.logger.info('Stopping Health Database...')
    await this.mongoClient.close()
  }

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<HealthService>('Cron').to(HealthService)
    this.container.bind<HealthController>('HealthController').to(HealthController)
    this.container.bind<BitcoinCore>('BitcoinCore').toConstantValue(
      new BitcoinCore({
        host: this.configuration.bitcoinUrl,
        port: this.configuration.bitcoinPort,
        network: this.configuration.bitcoinNetwork,
        username: this.configuration.bitcoinUsername,
        password: this.configuration.bitcoinPassword,
      })
    )
    this.container.bind<HealthServiceConfiguration>('HealthServiceConfiguration').toConstantValue({
      healthIntervalInSeconds: this.configuration.healthIntervalInSeconds,
    })
    this.container.bind<IPFS>("IPFS").to(IPFS);
    this.container
      .bind<IPFSConfiguration>("IPFSConfiguration")
      .toConstantValue({
        ipfsUrl: this.configuration.ipfsUrl
      });
  }
}

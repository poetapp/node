import { Messaging } from 'Messaging/Messaging'
import BitcoinCore = require('bitcoin-core')
import { Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration, BitcoinRPCConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { HealthController, HealthControllerConfiguration } from './HealthController'
import { HealthDAO } from './HealthDAO'
import { HealthService, HealthServiceConfiguration } from './HealthService'
import { IPFS, IPFSConfiguration } from './IPFS'
import { Router } from './Router'

export interface HealthConfiguration
  extends LoggingConfiguration,
    BitcoinRPCConfiguration,
    HealthServiceConfiguration,
    HealthControllerConfiguration,
    IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class Health {
  private readonly logger: Pino.Logger
  private readonly configuration: HealthConfiguration
  private readonly container = new Container()
  private mongoClient: MongoClient
  private dbConnection: Db
  private cron: HealthService
  private messaging: Messaging
  private router: Router

  constructor(configuration: HealthConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'Health Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    const exchangesMessaging = pick(['getHealth'], this.configuration.exchanges)
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.cron = this.container.get('Cron')
    await this.cron.start()

    this.logger.info('Health Started')
  }

  async stop() {
    this.logger.info('Stopping Health...')
    await this.cron.stop()
    await this.messaging.stop()
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
      }),
    )
    this.container.bind<HealthServiceConfiguration>('HealthServiceConfiguration').toConstantValue({
      healthIntervalInSeconds: this.configuration.healthIntervalInSeconds,
    })
    this.container.bind<ExchangeConfiguration>('ExchangeConfiguration').toConstantValue(this.configuration.exchanges)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({
      ipfsUrl: this.configuration.ipfsUrl,
    })
    this.container.bind<HealthControllerConfiguration>('HealthControllerConfiguration').toConstantValue({
      lowWalletBalanceInBitcoin: this.configuration.lowWalletBalanceInBitcoin,
      feeEstimateMinTargetBlock: this.configuration.feeEstimateMinTargetBlock,
    })
    this.container.bind<HealthDAO>('HealthDAO').to(HealthDAO)
  }
}

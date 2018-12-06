import { Messaging } from 'Messaging/Messaging'
import BitcoinCore = require('bitcoin-core')
import { Collection, Db, MongoClient } from 'mongodb'
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
  private mongoClient: MongoClient
  private dbConnection: Db
  private cron: HealthService
  private messaging: Messaging
  private router: Router
  private ipfsDirectoryHashInfoCollection: Collection

  constructor(configuration: HealthConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'Health Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    this.ipfsDirectoryHashInfoCollection = this.dbConnection.collection('ipfsDirectoryHashInfo')

    const exchangesMessaging = pick(
      ['getHealth', 'claimsNotDownloaded', 'ipfsHashTxId', 'poetAnchorDownloaded'],
      this.configuration.exchanges,
    )
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    const healthDAO = new HealthDAO({
      dependencies: {
        db: this.dbConnection,
      },
    })

    const bitcoinCore = new BitcoinCore({
      host: this.configuration.bitcoinUrl,
      port: this.configuration.bitcoinPort,
      network: this.configuration.bitcoinNetwork,
      username: this.configuration.bitcoinUsername,
      password: this.configuration.bitcoinPassword,
    })

    const ipfs = new IPFS({
      configuration: {
        ipfsUrl: this.configuration.ipfsUrl,
      },
    })

    const controller = new HealthController({
      dependencies: {
        logger: this.logger,
        healthDAO,
        bitcoinCore,
        ipfs,
      },
      configuration: {
        lowWalletBalanceInBitcoin: this.configuration.lowWalletBalanceInBitcoin,
        feeEstimateMinTargetBlock: this.configuration.feeEstimateMinTargetBlock,
      },
    })

    this.router = new Router({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
        controller,
      },
      exchange: this.configuration.exchanges,
    })
    await this.router.start()

    this.cron = new HealthService({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
      },
      configuration: {
        healthIntervalInSeconds: this.configuration.healthIntervalInSeconds,
      },
      exchange: this.configuration.exchanges,
    })
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
}

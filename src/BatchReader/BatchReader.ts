import { Db, MongoClient, Collection } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { DirectoryDAO } from './DirectoryDAO'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS, IPFSConfiguration } from './IPFS'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

export interface BatchReaderConfiguration extends LoggingConfiguration, ServiceConfiguration, IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class BatchReader {
  private readonly logger: Pino.Logger
  private readonly configuration: BatchReaderConfiguration
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private service: Service

  constructor(configuration: BatchReaderConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BatchReader Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], this.configuration.exchanges)
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    const ipfs = new IPFS({
      configuration: {
        ipfsUrl: this.configuration.ipfsUrl,
      },
    })

    const directoryCollection = this.dbConnection.collection('batchReader')

    const directoryDAO = new DirectoryDAO({
      dependencies: {
        directoryCollection,
      },
    })

    const claimController = new ClaimController({
      dependencies: {
        directoryDAO,
        ipfs,
      },
    })

    this.router = new Router({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
        claimController,
      },
      exchange: this.configuration.exchanges,
    })
    await this.router.start()

    this.service = new Service({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
      },
      configuration: {
        readNextDirectoryIntervalInSeconds: this.configuration.readNextDirectoryIntervalInSeconds,
      },
      exchange: this.configuration.exchanges,
    })
    await this.service.start()

    this.logger.info('BatchReader Started')
  }

  async stop() {
    this.logger.info('Stopping BatchReader...')
    this.logger.info('Stopping BatchReader Database...')
    await this.mongoClient.close()
    await this.router.stop()
    await this.service.stop()
  }
}

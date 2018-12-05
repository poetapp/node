import { Db, MongoClient, Collection } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { FileDAO } from './FileDAO'
import { IPFS, IPFSConfiguration } from './IPFS'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

export interface BatchWriterConfiguration extends LoggingConfiguration, ServiceConfiguration, IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class BatchWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BatchWriterConfiguration
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private service: Service

  constructor(configuration: BatchWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BatchWriter Starting')
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

    const fileCollection: Collection = this.dbConnection.collection('batchWriter')

    const fileDAO = new FileDAO({
      dependencies: {
        fileCollection,
      },
    })

    const claimController = new ClaimController({
      dependencies: {
        fileDAO,
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
        batchCreationIntervalInSeconds: this.configuration.batchCreationIntervalInSeconds,
      },
      exchange: this.configuration.exchanges,
    })
    await this.service.start()

    this.logger.info('Batcher Writer Started')
  }

  async stop() {
    this.logger.info('BatchWriter Stopping')
    await this.service.stop()
    this.logger.info('BatchWriter Database Stopping')
    await this.mongoClient.close()
    await this.router.stop()
  }
}

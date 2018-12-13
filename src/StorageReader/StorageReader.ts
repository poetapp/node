import { getVerifiableClaimSigner, VerifiableClaimSigner } from '@po.et/poet-js'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController, ClaimControllerConfiguration } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS, IPFSConfiguration } from './IPFS'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

import { LoggingConfiguration } from 'Configuration'

export interface StorageReaderConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    ClaimControllerConfiguration,
    IPFSConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class StorageReader {
  private readonly logger: Pino.Logger
  private readonly configuration: StorageReaderConfiguration
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private service: Service

  constructor(configuration: StorageReaderConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'StorageReader Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    const exchangesMessaging = pick(
      ['poetAnchorDownloaded', 'claimsDownloaded', 'claimsNotDownloaded'],
      this.configuration.exchanges,
    )
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    const ipfs = new IPFS({
      configuration: {
        ipfsUrl: this.configuration.ipfsUrl,
        downloadTimeoutInSeconds: this.configuration.downloadTimeoutInSeconds,
      },
    })

    const claimController = ClaimController({
      dependencies: {
        logger: this.logger,
        db: this.dbConnection,
        messaging: this.messaging,
        ipfs,
        verifiableClaimSigner: getVerifiableClaimSigner(),
      },
      configuration: {
        downloadRetryDelayInMinutes: this.configuration.downloadRetryDelayInMinutes,
        downloadMaxAttempts: this.configuration.downloadMaxAttempts,
      },
    })

    this.router = Router({
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
        claimController,
      },
      configuration: {
        downloadIntervalInSeconds: this.configuration.downloadIntervalInSeconds,
      },
    })
    await this.service.start()

    await this.createIndices()

    this.logger.info('StorageReader Started')
  }

  async stop() {
    this.logger.info('Stopping Storage...')
    await this.service.stop()
    this.logger.info('Stopping Storage Database...')
    await this.mongoClient.close()
    this.logger.info('Stopping Storage Messaging...')
    await this.messaging.stop()
  }

  private async createIndices() {
    const collection = this.dbConnection.collection('storage')
    await collection.createIndex({ ipfsFileHash: 1 }, { unique: true, name: 'ipfsFileHash-unique' })
    await collection.createIndex({ attempts: 1 }, { name: 'attempts' })
  }
}

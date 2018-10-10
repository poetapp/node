import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS } from './IPFS'
import { IPFSConfiguration } from './IPFSConfiguration'
import { Router } from './Router'
import { Service } from './Service'
import { ServiceConfiguration } from './ServiceConfiguration'
import { StorageReaderConfiguration } from './StorageReaderConfiguration'

@injectable()
export class StorageReader {
  private readonly logger: Pino.Logger
  private readonly configuration: StorageReaderConfiguration
  private readonly container = new Container()
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
      this.configuration.exchanges
    )
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.service = this.container.get('Service')
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

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({
      ipfsUrl: this.configuration.ipfsUrl,
      downloadTimeoutInSeconds: this.configuration.downloadTimeoutInSeconds,
    })
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<ClaimControllerConfiguration>('ClaimControllerConfiguration').toConstantValue({
      downloadRetryDelayInMinutes: this.configuration.downloadRetryDelayInMinutes,
      downloadMaxAttempts: this.configuration.downloadMaxAttempts,
    })
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<Service>('Service').to(Service)
    this.container.bind<ServiceConfiguration>('ServiceConfiguration').toConstantValue({
      downloadIntervalInSeconds: this.configuration.downloadIntervalInSeconds,
    })

    this.container.bind<ExchangeConfiguration>('ExchangeConfiguration').toConstantValue(this.configuration.exchanges)
  }

  private async createIndices() {
    const collection = this.dbConnection.collection('storage')
    await collection.createIndex({ ipfsFileHash: 1 }, { unique: true, name: 'ipfsFileHash-unique' })
    await collection.createIndex({ attempts: 1 }, { name: 'attempts' })
  }
}

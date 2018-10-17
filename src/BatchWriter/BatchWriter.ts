import { injectable, Container } from 'inversify'
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

@injectable()
export class BatchWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BatchWriterConfiguration
  private readonly container = new Container()
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

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.service = this.container.get('Service')
    await this.service.start()
    const fileDAO: FileDAO = this.container.get('FileDAO')
    await fileDAO.start()

    this.logger.info('Batcher Writer Started')
  }

  async stop() {
    this.logger.info('BatchWriter Stopping')
    await this.service.stop()
    this.logger.info('BatchWriter Database Stopping')
    await this.mongoClient.close()
    await this.router.stop()
  }

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<FileDAO>('FileDAO').to(FileDAO)
    this.container.bind<Collection>('fileCollection').toConstantValue(this.dbConnection.collection('batchWriter'))
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({
      ipfsUrl: this.configuration.ipfsUrl,
    })
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<Service>('Service').to(Service)
    this.container.bind<ServiceConfiguration>('ServiceConfiguration').toConstantValue({
      batchCreationIntervalInSeconds: this.configuration.batchCreationIntervalInSeconds,
    })

    this.container.bind<ExchangeConfiguration>('ExchangeConfiguration').toConstantValue(this.configuration.exchanges)
  }
}

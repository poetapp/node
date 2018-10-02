import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { DOAClaims, DOAClaimsConfiguration } from './DOAClaims'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS, IPFSConfiguration } from './IPFS'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

export interface StorageWriterConfiguration
  extends LoggingConfiguration,
    IPFSConfiguration,
    ServiceConfiguration,
    DOAClaimsConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

@injectable()
export class StorageWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: StorageWriterConfiguration
  private readonly container = new Container()
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private service: Service
  private doaClaims: DOAClaims

  constructor(configuration: StorageWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'StorageWriter Starting')
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

    this.doaClaims = this.container.get('DOAClaims')
    await this.doaClaims.start()

    this.logger.info('StorageWriter Started')
  }

  async stop() {
    this.logger.info('Stopping StorageWriter...')
    await this.router.stop()
    this.logger.info('Stopping StorageWriter DOAClaims...')
    await this.mongoClient.close()
  }

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({
      ipfsUrl: this.configuration.ipfsUrl,
    })
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<ExchangeConfiguration>('ExchangeConfiguration').toConstantValue(this.configuration.exchanges)
  }
}

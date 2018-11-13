import { injectable, Container } from 'inversify'
import { Collection, Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { IPFS, IPFSConfiguration } from 'Helpers/IPFS'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { DAOClaims, DAOClaimsConfiguration } from './DAOClaims'
import { DAOIntegrityCheckFailures } from './DAOIntegrityCheckFailures'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

export interface StorageWriterConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    DAOClaimsConfiguration {
  readonly ipfs: IPFSConfiguration
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
  private integrityCheckFailuresCollection: Collection
  private router: Router
  private messaging: Messaging
  private service: Service
  private daoClaims: DAOClaims
  private daoIntegrityCheckFailures: DAOIntegrityCheckFailures

  constructor(configuration: StorageWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'StorageWriter Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    const db = this.dbConnection = await this.mongoClient.db()

    this.integrityCheckFailuresCollection = db.collection('storageWriterIntegrityCheckFailures')

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], this.configuration.exchanges)
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.service = this.container.get('Service')
    await this.service.start()

    this.daoClaims = this.container.get('DAOClaims')
    await this.daoClaims.start()

    this.logger.info('StorageWriter Started')
  }

  async stop() {
    this.logger.info('Stopping StorageWriter Service')
    await this.service.stop()

    this.logger.info('Stopping StorageWriter...')
    await this.router.stop()

    this.logger.info('Stopping StorageWriter Database...')
    await this.mongoClient.close()
  }

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Collection>('integrityCheckFailuresCollection')
      .toConstantValue(this.integrityCheckFailuresCollection)
    this.container.bind<DAOClaims>('DAOClaims').to(DAOClaims)
    this.container.bind<DAOClaimsConfiguration>('DAOClaimsConfiguration').toConstantValue({
      maxStorageAttempts: this.configuration.maxStorageAttempts,
    })
    this.container.bind<DAOIntegrityCheckFailures>('DAOIntegrityCheckFailures').to(DAOIntegrityCheckFailures)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<IPFS>('IPFS').toConstantValue(IPFS(this.configuration.ipfs))
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<ExchangeConfiguration>('ExchangeConfiguration').toConstantValue(this.configuration.exchanges)
    this.container.bind<Service>('Service').to(Service)
    this.container.bind<ServiceConfiguration>('ServiceConfiguration').toConstantValue({
      uploadClaimIntervalInSeconds: this.configuration.uploadClaimIntervalInSeconds,
    })
  }
}

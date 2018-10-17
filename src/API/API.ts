import { injectable, Container } from 'inversify'
import { MongoClient, Db } from 'mongodb'
import * as Pino from 'pino'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { APIConfiguration } from './APIConfiguration'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { HealthController } from './HealthController'
import { Router } from './Router'
import { RouterConfiguration } from './RouterConfiguration'
import { WorkController } from './WorkController'

@injectable()
export class API {
  private readonly logger: Pino.Logger
  private readonly configuration: APIConfiguration
  private readonly container = new Container()
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging

  constructor(configuration: APIConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'API Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    this.messaging = new Messaging(this.configuration.rabbitmqUrl, this.configuration.exchanges)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.logger.info('API Started')
  }

  async stop() {
    this.logger.info('Stopping API...')
    this.logger.info('Stopping API Database...')
    await this.mongoClient.close()
    await this.router.stop()
    this.logger.info('Stopping API Messaging...')
    await this.messaging.stop()
  }

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<RouterConfiguration>('RouterConfiguration').toConstantValue({ port: this.configuration.port })
    this.container.bind<WorkController>('WorkController').to(WorkController)
    this.container.bind<HealthController>('HealthController').to(HealthController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<ExchangeConfiguration>('ExchangeConfiguration').toConstantValue(this.configuration.exchanges)
  }
}

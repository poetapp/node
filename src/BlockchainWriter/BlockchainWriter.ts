import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { InsightClient } from 'poet-js'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { BlockchainWriterConfiguration } from './BlockchainWriterConfiguration'
import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { Router } from './Router'
import { Service } from './Service'
import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class BlockchainWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BlockchainWriterConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private service: Service

  constructor(configuration: BlockchainWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info(
      { configuration: this.configuration },
      'BlockchainWriter Starting'
    )
    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await mongoClient.db()

    this.messaging = new Messaging(this.configuration.rabbitmqUrl)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.service = this.container.get('Service')
    await this.service.start()

    this.logger.info('BlockchainWriter Started')
  }

  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container
      .bind<InsightClient>('InsightHelper')
      .toConstantValue(new InsightClient(this.configuration.insightUrl))
    this.container
      .bind<ClaimControllerConfiguration>('ClaimControllerConfiguration')
      .toConstantValue(this.configuration)
    this.container.bind<Service>('Service').to(Service)
    this.container
      .bind<ServiceConfiguration>('ServiceConfiguration')
      .toConstantValue({
        timestampIntervalInSeconds: this.configuration
          .timestampIntervalInSeconds
      })
  }
}

import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'

import { InsightHelper } from 'Helpers/Insight'
import { Messaging } from 'Messaging/Messaging'

import { BlockchainWriterConfiguration } from './BlockchainWriterConfiguration'
import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { Router } from './Router'

@injectable()
export class BlockchainWriter {
  private readonly configuration: BlockchainWriterConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private router: Router
  private messaging: Messaging

  constructor(configuration: BlockchainWriterConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('BlockchainWriter Starting...', this.configuration)
    this.dbConnection = await MongoClient.connect(this.configuration.dbUrl)

    this.messaging = new Messaging(this.configuration.rabbitmqUrl)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    console.log('BlockchainWriter Started')
  }

  initializeContainer() {
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<InsightHelper>('InsightHelper').toConstantValue(new InsightHelper(this.configuration.insightUrl))
    this.container.bind<ClaimControllerConfiguration>('ClaimControllerConfiguration').toConstantValue(this.configuration)
  }
}

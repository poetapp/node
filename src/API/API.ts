import { injectable, Container } from 'inversify'
import { MongoClient, Db } from 'mongodb'

import { Messaging } from 'Messaging/Messaging'

import { APIConfiguration } from './APIConfiguration'
import { Router } from './Router'
import { RouterConfiguration } from './RouterConfiguration'
import { WorkController } from './WorkController'

@injectable()
export class API {
  private readonly configuration: APIConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private router: Router
  private messaging: Messaging

  constructor(configuration: APIConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('API Starting...', this.configuration)
    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await mongoClient.db()

    this.messaging = new Messaging(this.configuration.rabbitmqUrl)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    console.log('API Started')
  }

  initializeContainer() {
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<RouterConfiguration>('RouterConfiguration').toConstantValue({port: this.configuration.port})
    this.container.bind<WorkController>('WorkController').to(WorkController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
  }
}

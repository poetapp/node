import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'

import { Messaging } from 'Messaging/Messaging'

import { Router } from './Router'
import { ViewConfiguration } from './ViewConfiguration'
import { WorkController } from './WorkController'

@injectable()
export class View {
  private readonly configuration: ViewConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private router: Router
  private messaging: Messaging

  constructor(configuration: ViewConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('View Starting...', this.configuration)
    this.dbConnection = await MongoClient.connect(this.configuration.dbUrl)

    this.messaging = new Messaging()
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    console.log('View Started')
  }

  initializeContainer() {
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<WorkController>('WorkController').to(WorkController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
  }
}

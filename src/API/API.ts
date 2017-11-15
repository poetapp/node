import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'

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

  constructor(configuration: APIConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('API Starting...', this.configuration)
    this.dbConnection = await MongoClient.connect(this.configuration.dbUrl)

    this.initializeContainer()

    this.router = this.container.get('Router')
    this.router.start()

    console.log('API Started')
  }

  initializeContainer() {
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<RouterConfiguration>('RouterConfiguration').toConstantValue({port: this.configuration.port})
    this.container.bind<WorkController>('WorkController').to(WorkController)
  }
}

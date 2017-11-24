import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'

import { Messaging } from 'Messaging/Messaging'

import { IPFS } from './IPFS'
import { IPFSConfiguration } from './IPFSConfiguration'
import { Router } from './Router'
import { StorageConfiguration } from './StorageConfiguration'
import { ClaimController } from './ClaimController'

@injectable()
export class Storage {
  private readonly configuration: StorageConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private router: Router
  private messaging: Messaging

  constructor(configuration: StorageConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('Storage Starting...', this.configuration)
    this.dbConnection = await MongoClient.connect(this.configuration.dbUrl)

    this.messaging = new Messaging()
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    this.router.start()

    console.log('Storage Started')
  }

  initializeContainer() {
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({ipfsUrl: this.configuration.ipfsUrl})
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
  }
}

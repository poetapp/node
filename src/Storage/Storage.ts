import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'

import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { IPFS } from './IPFS'
import { IPFSConfiguration } from './IPFSConfiguration'
import { Router } from './Router'
import { Service } from './Service'
import { ServiceConfiguration } from './ServiceConfiguration'
import { StorageConfiguration } from './StorageConfiguration'

@injectable()
export class Storage {
  private readonly configuration: StorageConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private service: Service

  constructor(configuration: StorageConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('Storage Starting...', this.configuration)
    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await mongoClient.db()

    this.messaging = new Messaging(this.configuration.rabbitmqUrl)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    this.service = this.container.get('Service')
    await this.service.start()

    await this.createIndices()

    console.log('Storage Started')
  }

  initializeContainer() {
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({ipfsUrl: this.configuration.ipfsUrl})
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<Service>('Service').to(Service)
    this.container.bind<ServiceConfiguration>('ServiceConfiguration')
      .toConstantValue({ downloadIntervalInSeconds: this.configuration.downloadIntervalInSeconds })
  }

  private async createIndices() {
    const collection = this.dbConnection.collection('storage')
    await collection.createIndex({ ipfsHash: 1 }, { unique: true, name: 'ipfsHash-unique' })
    await collection.createIndex({ attempts: 1 }, { name: 'attempts' })
  }
}

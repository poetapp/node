import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { createModuleLogger } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { BatchWriterConfiguration } from './BatchWriterConfiguration'
import { FileCollection } from './FileCollection'
import { IPFS } from './IPFS'
import { IPFSConfiguration } from './IPFSConfiguration'
import { Router } from './Router'

@injectable()
export class BatchWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BatchWriterConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private fileCollection: FileCollection
  private router: Router
  private messaging: Messaging

  constructor(configuration: BatchWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BatchWriter Starting')
    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await mongoClient.db()

    this.messaging = new Messaging(this.configuration.rabbitmqUrl)
    await this.messaging.start()

    this.initializeContainer()

    this.router = this.container.get('Router')
    await this.router.start()

    // TODO: don't new FileCollection, let the container instantiate it
    // container = factory
    this.fileCollection = this.container.get('FileCollection')
    await this.fileCollection.start()

    this.startIntervals()

    this.logger.info('Batcher Started')
  }

  // this is the composition root.
  initializeContainer() {
    this.container.bind<Pino.Logger>('Logger').toConstantValue(this.logger)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    // Problem: file/class name conflicts with MongoDB concept.
    // FileCollection should refer to an instance of a MongoDB collection bound to the file collection
    // Rename to FileDAO?
    this.container.bind<FileCollection>('FileCollection').toConstantValue(this.fileCollection)
    this.container.bind<IPFS>('IPFS').to(IPFS)
    this.container.bind<IPFSConfiguration>('IPFSConfiguration').toConstantValue({
      ipfsUrl: this.configuration.ipfsUrl,
    })
    this.container.bind<Router>('Router').to(Router)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
  }

  // OK to not use Service since all our intervals will simply publish messages to sagas, no logic or dependencies
  startIntervals() {
    setInterval(
      () => this.messaging.publish(Exchange.BatchWriterCreateNextBatchRequest, ''),
      secondsToMiliseconds(this.configuration.createNextBatchIntervalInSeconds)
    )
  }
}

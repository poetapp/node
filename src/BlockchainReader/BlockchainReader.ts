import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import { InsightClient } from 'poet-js'

import { Messaging } from 'Messaging/Messaging'

import { BlockchainReaderConfiguration } from './BlockchainReaderConfiguration'
import { BlockchainReaderService } from './BlockchainReaderService'
import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

@injectable()
export class BlockchainReader {
  private readonly configuration: BlockchainReaderConfiguration
  private readonly container = new Container()
  private dbConnection: Db
  private messaging: Messaging
  private cron: BlockchainReaderService

  constructor(configuration: BlockchainReaderConfiguration) {
    this.configuration = configuration
  }

  async start() {
    console.log('BlockchainReader Starting...', this.configuration)
    this.dbConnection = await MongoClient.connect(this.configuration.dbUrl)

    this.messaging = new Messaging(this.configuration.rabbitmqUrl)
    await this.messaging.start()

    this.initializeContainer()

    this.cron = this.container.get('Cron')
    await this.cron.start()

    console.log('BlockchainReader Started')
  }

  initializeContainer() {
    this.container.bind<ClaimController>('ClaimController').to(ClaimController)
    this.container.bind<BlockchainReaderService>('Cron').to(BlockchainReaderService)
    this.container.bind<Db>('DB').toConstantValue(this.dbConnection)
    this.container.bind<Messaging>('Messaging').toConstantValue(this.messaging)
    this.container.bind<InsightClient>('InsightHelper').toConstantValue(new InsightClient(this.configuration.insightUrl))
    this.container.bind<ClaimControllerConfiguration>('ClaimControllerConfiguration').toConstantValue(this.configuration)
    this.container.bind<BlockchainReaderServiceConfiguration>('BlockchainReaderServiceConfiguration').toConstantValue({
      minimumBlockHeight: this.configuration.minimumBlockHeight,
      blockchainReaderIntervalInSeconds: this.configuration.blockchainReaderIntervalInSeconds,
      forceBlockHeight: this.configuration.forceBlockHeight,
    })
  }
}

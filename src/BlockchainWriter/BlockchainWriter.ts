import BitcoinCore = require('bitcoin-core')
import { injectable, Container } from 'inversify'
import { Collection, MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { bitcoinRPCConfigurationToBitcoinCoreArguments } from 'Helpers/Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { BlockchainWriterConfiguration } from './BlockchainWriterConfiguration'
import { Controller } from './Controller'
import { ControllerConfiguration } from './ControllerConfiguration'
import { DAO } from './DAO'
import { Router } from './Router'
import { Service } from './Service'
import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class BlockchainWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BlockchainWriterConfiguration

  constructor(configuration: BlockchainWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BlockchainWriter Starting')

    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    const db = await mongoClient.db()

    const blockchainWriterCollection = db.collection('blockchainWriter')

    const container = createContainer(this.configuration, this.logger, blockchainWriterCollection)

    const messaging = container.get('Messaging') as Messaging
    await messaging.start()

    const router = container.get('Router') as Router
    await router.start()

    const service = container.get('Service') as Service
    await service.start()

    const dao = container.get('DAO') as DAO
    await dao.start()

    this.logger.info('BlockchainWriter Started')
  }
}

const createContainer = (
  configuration: BlockchainWriterConfiguration,
  logger: Pino.Logger,
  blockchainWriterCollection: Collection
) => {
  const container = new Container()

  container.bind<Router>('Router').to(Router)
  container.bind<Controller>('Controller').to(Controller)
  container.bind<Service>('Service').to(Service)
  container.bind<DAO>('DAO').to(DAO)

  container.bind<Pino.Logger>('Logger').toConstantValue(logger)
  container.bind<Collection>('BlockchainWriterCollection').toConstantValue(blockchainWriterCollection)
  container.bind<Messaging>('Messaging').toConstantValue(new Messaging(configuration.rabbitmqUrl))
  container
    .bind<BitcoinCore>('BitcoinCore')
    .toConstantValue(new BitcoinCore(bitcoinRPCConfigurationToBitcoinCoreArguments(configuration)))
  container.bind<ServiceConfiguration>('ServiceConfiguration').toConstantValue({
    timestampIntervalInSeconds: configuration.timestampIntervalInSeconds,
  })
  container.bind<ControllerConfiguration>('ClaimControllerConfiguration').toConstantValue(configuration)

  return container
}

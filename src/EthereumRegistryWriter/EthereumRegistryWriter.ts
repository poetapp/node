import { MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { IPFS, IPFSConfiguration } from 'Helpers/IPFS'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { Controller } from './Controller'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { Service } from './Service'

export interface EthereumRegistryWriterConfiguration extends LoggingConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
  readonly ipfs: IPFSConfiguration
}

type stop = () => Promise<void>

export const EthereumRegistryWriter = async (configuration: EthereumRegistryWriterConfiguration): Promise<stop> => {
  const logger: Pino.Logger = createModuleLogger(configuration, __dirname)

  logger.info({ configuration }, 'EthereumRegistryWriter Starting')

  const mongoClient = await MongoClient.connect(configuration.dbUrl)
  const dbConnection = await mongoClient.db()

  const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], configuration.exchanges)
  const messaging = new Messaging(configuration.rabbitmqUrl, exchangesMessaging)
  await messaging.start()

  const ipfs = IPFS(configuration.ipfs)

  const controller = Controller({
    dependencies: {
      logger,
      db: dbConnection,
      ipfs,
    },
  })

  const router = Router({
    dependencies: {
      logger,
      messaging,
      controller,
    },
    exchange: configuration.exchanges,
  })
  await router.start()
  await controller.createDbIndices()

  const service = Service({
    dependencies: {
      logger,
      controller,
    },
    configuration: {
      uploadAnchorReceiptIntervalInSeconds: 5,
    },
  })
  await service.start()

  logger.info('EthereumRegistryWriter Started')

  return async () => {
    logger.info('Stopping EthereumRegistryWriter...')
    await service.stop()
    logger.debug('Stopping EthereumRegistryWriter Messaging...')
    await messaging.stop()
    logger.debug('Stopping EthereumRegistryWriter Database...')
    await mongoClient.close()
    logger.info('Stopped EthereumRegistryWriter...')
  }

}

import { MongoClient } from 'mongodb'
import Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { EthereumRegistryContract } from 'Helpers/EthereumRegistryContract'
import { IPFS, IPFSConfiguration } from 'Helpers/IPFS'
import { loggingConfigurationToPinoConfiguration } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { Business } from './Business'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { Scheduler } from './Scheduler'

export interface EthereumRegistryWriterConfiguration extends LoggingConfiguration {
  readonly mongodbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
  readonly ipfs: IPFSConfiguration
  readonly rpcUrl: string
  readonly chainId: number
  readonly contractAddress: string
  readonly privateKey: string
  readonly uploadAnchorReceiptIntervalInSeconds: number
  readonly registerNextDirectoryIntervalInSeconds: number
}

type stop = () => Promise<void>

export const EthereumRegistryWriter = async (configuration: EthereumRegistryWriterConfiguration): Promise<stop> => {
  const logger = Pino(loggingConfigurationToPinoConfiguration(configuration))

  logger.info({ configuration }, 'EthereumRegistryWriter Starting')

  const mongoClient = await MongoClient.connect(configuration.mongodbUrl)
  const db = await mongoClient.db()

  const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], configuration.exchanges)
  const messaging = new Messaging(configuration.rabbitmqUrl, exchangesMessaging)
  await messaging.start()

  const ipfs = IPFS(configuration.ipfs)

  const ethereumRegistryContract = EthereumRegistryContract({
    rpcUrl: configuration.rpcUrl,
    chainId: configuration.chainId,
    contractAddress: configuration.contractAddress,
    privateKey: configuration.privateKey,
  })

  const business = Business({
    dependencies: {
      logger,
      db,
      ipfs,
      ethereumRegistryContract,
    },
  })
  await business.createDbIndices()

  const router = Router({
    dependencies: {
      logger,
      messaging,
      business,
    },
    exchange: configuration.exchanges,
  })
  await router.start()

  const scheduler = Scheduler({
    dependencies: {
      logger,
      business,
    },
    configuration: {
      uploadAnchorReceiptIntervalInSeconds: configuration.uploadAnchorReceiptIntervalInSeconds,
      registerNextDirectoryIntervalInSeconds: configuration.registerNextDirectoryIntervalInSeconds,
    },
  })
  await scheduler.start()

  logger.info('EthereumRegistryWriter Started')

  return async () => {
    logger.info('Stopping EthereumRegistryWriter...')
    await scheduler.stop()
    logger.debug('Stopping EthereumRegistryWriter Messaging...')
    await messaging.stop()
    logger.info('EthereumRegistryWriter Messaging Stopped')
    logger.debug('Closing database connection...')
    await mongoClient.close()
    logger.info('Database connection closed')
    logger.info('Stopped EthereumRegistryWriter...')
  }

}

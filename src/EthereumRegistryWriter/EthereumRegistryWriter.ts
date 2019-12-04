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
  readonly apiPort: number
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
  readonly gasPrice?: number
  readonly maximumUnconfirmedTransactionAgeInSeconds: number
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
    gasPrice: configuration.gasPrice,
  })

  logger.info({ ethereumAccountAddress: ethereumRegistryContract.accountAddress })

  const business = Business({
    dependencies: {
      logger,
      db,
      ipfs,
      ethereumRegistryContract,
    },
    configuration: {
      maximumUnconfirmedTransactionAgeInSeconds: configuration.maximumUnconfirmedTransactionAgeInSeconds,
    },
  })
  await business.createDbIndices()

  const router = Router({
    dependencies: {
      logger,
      messaging,
      business,
      ethereumRegistryContract,
    },
    configuration: {
      apiPort: configuration.apiPort,
      exchange: configuration.exchanges,
    },
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
    await router.stop()
    logger.debug('Stopping EthereumRegistryWriter Messaging...')
    await messaging.stop()
    logger.info('EthereumRegistryWriter Messaging Stopped')
    logger.debug('Closing database connection...')
    await mongoClient.close()
    logger.info('Database connection closed')
    logger.debug('Closing WS connection to geth...')
    ethereumRegistryContract.close()
    logger.info('WS connection to geth closed')
    logger.info('Stopped EthereumRegistryWriter...')
  }

}

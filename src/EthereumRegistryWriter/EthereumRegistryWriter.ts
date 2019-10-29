import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { WorkController } from './WorkController'

export interface ViewConfiguration extends LoggingConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export interface EthereumRegistryWriter {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const View = (configuration: ViewConfiguration): EthereumRegistryWriter => {
  let router: Router
  let mongoClient: MongoClient
  let dbConnection: Db
  let messaging: Messaging

  const logger: Pino.Logger = createModuleLogger(configuration, __dirname)

  const start = async () => {
    logger.info({ configuration }, 'EthereumRegistryWriter Starting')
    mongoClient = await MongoClient.connect(configuration.dbUrl)
    dbConnection = await mongoClient.db()

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], configuration.exchanges)
    messaging = new Messaging(configuration.rabbitmqUrl, exchangesMessaging)
    await messaging.start()

    const workController = WorkController({
      dependencies: {
        logger,
        db: dbConnection,
      },
    })

    router = Router({
      dependencies: {
        logger,
        messaging,
        workController,
      },
      exchange: configuration.exchanges,
    })
    await router.start()
    await workController.createDbIndices()

    logger.info('EthereumRegistryWriter Started')
  }

  const stop = async () => {
    logger.info('Stopping EthereumRegistryWriter...')
    await router.stop()
    logger.info('Stopping EthereumRegistryWriter Database...')
    await mongoClient.close()
  }

  return {
    start,
    stop,
  }
}

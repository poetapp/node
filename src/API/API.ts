import { getVerifiableClaimSigner } from '@po.et/poet-js'
import { Collection, MongoClient, Db } from 'mongodb'
import * as Pino from 'pino'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { FileController, FileControllerConfiguration } from './FileController'
import * as FileDAO from './FileDAO'
import { HealthController } from './HealthController'
import { Router } from './Router'
import { WorkController } from './WorkController'

export interface APIConfiguration extends LoggingConfiguration, FileControllerConfiguration {
  readonly port: number
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export interface API {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const API = (configuration: APIConfiguration): API => {
  let mongoClient: MongoClient
  let dbConnection: Db
  let router: Router
  let messaging: Messaging
  let fileCollection: Collection

  const logger = createModuleLogger(configuration, __dirname)

  const start = async () => {
    logger.info({ configuration }, 'API Starting')
    mongoClient = await MongoClient.connect(configuration.dbUrl)
    dbConnection = await mongoClient.db()

    fileCollection = dbConnection.collection('files')

    messaging = new Messaging(configuration.rabbitmqUrl, configuration.exchanges)
    await messaging.start()

    const fileDao = FileDAO.FileDAO({
      dependencies: {
        collection: fileCollection,
      },
    })

    const fileController = FileController({
      dependencies: {
        fileDao,
        logger,
      },
      configuration: {
        ipfsArchiveUrlPrefix: configuration.ipfsArchiveUrlPrefix,
        ipfsUrl: configuration.ipfsUrl,
      },
    })

    const workController = WorkController({
      dependencies: {
        logger,
        db: dbConnection,
        messaging,
      },
      exchange: configuration.exchanges,
    })

    const healthController = HealthController({
      dependencies: {
        db: dbConnection,
        logger,
      },
    })

    router = Router({
      dependencies: {
        logger,
        fileController,
        workController,
        healthController,
        verifiableClaimSigner: getVerifiableClaimSigner(),
      },
      configuration: {
        port: configuration.port,
      },
    })
    await router.start()

    logger.info('API Started')
  }

  const stop = async () => {
    logger.info('Stopping API...')
    logger.info('Stopping API Database...')
    await mongoClient.close()
    await router.stop()
    logger.info('Stopping API Messaging...')
    await messaging.stop()
  }

  return {
    start,
    stop,
  }
}

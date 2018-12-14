import { getVerifiableClaimSigner, VerifiableClaimSigner } from '@po.et/poet-js'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController, ClaimControllerConfiguration } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS, IPFSConfiguration } from './IPFS'
import { Router } from './Router'
import { Service, ServiceConfiguration } from './Service'

import { LoggingConfiguration } from 'Configuration'

export interface StorageReaderConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    ClaimControllerConfiguration,
    IPFSConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export interface StorageReader {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const StorageReader = (configuration: StorageReaderConfiguration): StorageReader => {
  let mongoClient: MongoClient
  let dbConnection: Db
  let router: Router
  let messaging: Messaging
  let service: Service

  const logger = createModuleLogger(configuration, __dirname)

  const start = async () => {
    logger.info({ configuration }, 'StorageReader Starting')
    mongoClient = await MongoClient.connect(configuration.dbUrl)
    dbConnection = await mongoClient.db()

    const exchangesMessaging = pick(
      ['poetAnchorDownloaded', 'claimsDownloaded', 'claimsNotDownloaded'],
      configuration.exchanges,
    )
    messaging = new Messaging(configuration.rabbitmqUrl, exchangesMessaging)
    await messaging.start()

    const ipfs = IPFS({
      configuration: {
        ipfsUrl: configuration.ipfsUrl,
        downloadTimeoutInSeconds: configuration.downloadTimeoutInSeconds,
      },
    })

    const claimController = ClaimController({
      dependencies: {
        logger,
        db: dbConnection,
        messaging,
        ipfs,
        verifiableClaimSigner: getVerifiableClaimSigner(),
      },
      configuration: {
        downloadRetryDelayInMinutes: configuration.downloadRetryDelayInMinutes,
        downloadMaxAttempts: configuration.downloadMaxAttempts,
      },
    })

    router = Router({
      dependencies: {
        logger,
        messaging,
        claimController,
      },
      exchange: configuration.exchanges,
    })
    await router.start()

    service = Service({
      dependencies: {
        logger,
        claimController,
      },
      configuration: {
        downloadIntervalInSeconds: configuration.downloadIntervalInSeconds,
      },
    })
    await service.start()

    await createIndices()

    logger.info('StorageReader Started')
  }

  const stop = async () => {
    logger.info('Stopping Storage...')
    await service.stop()
    logger.info('Stopping Storage Database...')
    await mongoClient.close()
    logger.info('Stopping Storage Messaging...')
    await messaging.stop()
  }

  const createIndices = async () => {
    const collection = dbConnection.collection('storage')
    await collection.createIndex({ ipfsFileHash: 1 }, { unique: true, name: 'ipfsFileHash-unique' })
    await collection.createIndex({ attempts: 1 }, { name: 'attempts' })
  }

  return {
    start,
    stop,
  }
}

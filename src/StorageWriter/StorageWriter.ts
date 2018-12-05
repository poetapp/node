import { injectable, Container } from 'inversify'
import { Collection, Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { IPFS, IPFSConfiguration } from 'Helpers/IPFS'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { DAOClaims, DAOClaimsConfiguration } from './DAOClaims'
import { DAOIntegrityCheckFailures } from './DAOIntegrityCheckFailures'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import * as Service from './Service'

export interface StorageWriterConfiguration
  extends LoggingConfiguration,
    Service.Configuration,
    DAOClaimsConfiguration {
  readonly ipfs: IPFSConfiguration
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export interface StorageWriter {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const StorageWriter = (
  configuration: StorageWriterConfiguration,
): StorageWriter => {
  const logger = createModuleLogger(configuration, __dirname)

  let db: Db
  let mongoClient: MongoClient
  let router: Router
  let service: Service.Service
  let daoClaims: DAOClaims
  let daoIntegrityCheckFailures: DAOIntegrityCheckFailures
  let messaging: Messaging
  let claimController: ClaimController
  let ipfs: IPFS

  const start = async () => {
    logger.info({ configuration }, 'StorageWriter Starting')

    mongoClient = await MongoClient.connect(configuration.dbUrl)
    db = await mongoClient.db()

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], configuration.exchanges)
    messaging = new Messaging(configuration.rabbitmqUrl, exchangesMessaging)
    await messaging.start()

    daoClaims = DAOClaims({
      dependencies: {
        collection: db.collection('storageWriterClaims'),
      },
      configuration: {
        maxStorageAttempts: 3,
      },
    })

    daoIntegrityCheckFailures = DAOIntegrityCheckFailures({
      dependencies: {
        collection: db.collection('storageWriterIntegrityCheckFailures'),
      },
    })

    ipfs = IPFS(configuration.ipfs)

    claimController = ClaimController({
      dependencies: {
        logger,
        daoClaims,
        daoIntegrityCheckFailures,
        ipfs,
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

    service = Service.Service({
      dependencies: {
        logger,
        messaging,
      },
      configuration: {
        uploadClaimIntervalInSeconds: configuration.uploadClaimIntervalInSeconds,
      },
      exchange: configuration.exchanges,
    })
    await service.start()

    logger.info('StorageWriter Started')
  }

  const stop = async () => {
    logger.info('Stopping StorageWriter Service')
    await service.stop()

    logger.info('Stopping StorageWriter...')
    await router.stop()

    logger.info('Stopping StorageWriter Database...')
    await mongoClient.close()
  }

  return {
    start,
    stop,
  }
}

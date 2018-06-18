#!/usr/bin/env node

/* tslint:disable:no-console */
import 'Error'
import * as Pino from 'pino'
import 'reflect-metadata'

import 'Extensions/Promise'

import { API } from 'API/API'
import { BlockchainReader } from 'BlockchainReader/BlockchainReader'
import { BlockchainWriter } from 'BlockchainWriter/BlockchainWriter'
import { loadConfigurationWithDefaults } from 'Configuration'
import { Storage } from 'Storage/Storage'
import { View } from 'View/View'

async function main() {
  console.log('Running Po.et Node')
  console.log('')
  console.log('Loading Configuration...')

  const configuration = loadConfigurationWithDefaults()

  console.log('Switching to Structured Logging')
  console.log('Logging Level:', configuration.loggingLevel)
  console.log('')

  const logger: Pino.Logger = Pino({
    level: configuration.loggingLevel,
    prettyPrint: configuration.loggingPretty,
  })

  logger.info(configuration, 'Loaded Configuration and merged with defaults')

  const loggingConfiguration = {
    loggingLevel: configuration.loggingLevel,
    loggingPretty: configuration.loggingPretty,
  }

  const api = new API({
    ...loggingConfiguration,
    port: configuration.apiPort,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
  })
  try {
    await api.start()
  } catch (exception) {
    logger.error({ exception }, 'API was unable to start')
  }

  const view = new View({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
  })
  try {
    await view.start()
  } catch (exception) {
    logger.error({ exception }, 'View was unable to start')
  }

  const storage = new Storage({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    ipfsUrl: configuration.ipfsUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    downloadIntervalInSeconds: configuration.downloadIntervalInSeconds,
    downloadRetryDelayInMinutes: configuration.downloadRetryDelayInMinutes,
    downloadMaxAttempts: configuration.downloadMaxAttempts,
    downloadTimeoutInSeconds: configuration.downloadTimeoutInSeconds,
  })
  try {
    await storage.start()
  } catch (exception) {
    logger.error({ exception }, 'Storage was unable to start')
  }

  if (configuration.enableTimestamping) {
    const blockchainWriter = new BlockchainWriter({
      ...loggingConfiguration,
      dbUrl: configuration.mongodbUrl,
      rabbitmqUrl: configuration.rabbitmqUrl,
      insightUrl: configuration.insightUrl,
      bitcoinAddress: configuration.bitcoinAddress,
      bitcoinAddressPrivateKey: configuration.bitcoinAddressPrivateKey,
      poetNetwork: configuration.poetNetwork,
      poetVersion: configuration.poetVersion,
      timestampIntervalInSeconds: configuration.timestampIntervalInSeconds,
    })
    try {
      await blockchainWriter.start()
    } catch (exception) {
      logger.error({ exception }, 'BlockchainWriter was unable to start')
    }
  }

  const blockchainReader = new BlockchainReader({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    insightUrl: configuration.insightUrl,
    poetNetwork: configuration.poetNetwork,
    poetVersion: configuration.poetVersion,
    minimumBlockHeight: configuration.minimumBlockHeight,
    forceBlockHeight: configuration.forceBlockHeight,
    blockchainReaderIntervalInSeconds: configuration.blockchainReaderIntervalInSeconds,
  })
  try {
    await blockchainReader.start()
  } catch (exception) {
    logger.error({ exception }, 'BlockchainReader was unable to start')
  }
}

main().catch(console.error)

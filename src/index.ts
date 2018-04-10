import 'reflect-metadata'

import * as Pino from 'pino'

import { loadConfigurationWithDefaults } from 'Configuration'

import { API } from 'API/API'
import { BlockchainReader } from 'BlockchainReader/BlockchainReader'
import { BlockchainWriter } from 'BlockchainWriter/BlockchainWriter'
import { Storage } from 'Storage/Storage'
import { View } from 'View/View'

async function main() {
  console.log('Running Po.et Node')
  console.log('')
  console.log('Loading Configuration...')

  const Configuration = loadConfigurationWithDefaults()

  console.log('Switching to Structured Logging')
  console.log('Logging Level:', Configuration.loggingLevel)
  console.log('')

  const logger: Pino.Logger = Pino({ level: Configuration.loggingLevel, prettyPrint: Configuration.loggingPretty })

  logger.info(Configuration, 'Loaded Configuration')

  const loggingConfiguration = {
    loggingLevel: Configuration.loggingLevel,
    loggingPretty: Configuration.loggingPretty,
  }

  const api = new API({
    ...loggingConfiguration,
    port: Configuration.apiPort,
    dbUrl: Configuration.mongodbUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
  })
  try {
    await api.start()
  } catch (exception) {
    logger.error({ exception }, 'API was unable to start')
  }

  const view = new View({
    ...loggingConfiguration,
    dbUrl: Configuration.mongodbUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
  })
  try {
    await view.start()
  } catch (exception) {
    logger.error({ exception }, 'View was unable to start')
  }

  const storage = new Storage({
    ...loggingConfiguration,
    dbUrl: Configuration.mongodbUrl,
    ipfsUrl: Configuration.ipfsUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
    downloadIntervalInSeconds: Configuration.downloadIntervalInSeconds,
  })
  try {
    await storage.start()
  } catch (exception) {
    logger.error({ exception }, 'Storage was unable to start')
  }

  if (Configuration.enableTimestamping) {
    const blockchainWriter = new BlockchainWriter({
      ...loggingConfiguration,
      dbUrl: Configuration.mongodbUrl,
      rabbitmqUrl: Configuration.rabbitmqUrl,
      insightUrl: Configuration.insightUrl,
      bitcoinAddress: Configuration.bitcoinAddress,
      bitcoinAddressPrivateKey: Configuration.bitcoinAddressPrivateKey,
      poetNetwork: Configuration.poetNetwork,
      poetVersion: Configuration.poetVersion,
      timestampIntervalInSeconds: Configuration.timestampIntervalInSeconds,
    })
    try {
      await blockchainWriter.start()
    } catch (exception) {
      logger.error({ exception }, 'BlockchainWriter was unable to start')
    }
  }

  const blockchainReader = new BlockchainReader({
    ...loggingConfiguration,
    dbUrl: Configuration.mongodbUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
    insightUrl: Configuration.insightUrl,
    poetNetwork: Configuration.poetNetwork,
    poetVersion: Configuration.poetVersion,
    minimumBlockHeight: Configuration.minimumBlockHeight,
    forceBlockHeight: Configuration.forceBlockHeight,
    blockchainReaderIntervalInSeconds: Configuration.blockchainReaderIntervalInSeconds,
  })
  try {
    await blockchainReader.start()
  } catch (exception) {
    logger.error({ exception }, 'BlockchainReader was unable to start')
  }
}

main().catch(console.error)

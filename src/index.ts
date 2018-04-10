import 'reflect-metadata'

import * as Pino from 'pino'

import { Configuration } from 'Configuration'

import { API } from 'API/API'
import { BlockchainReader } from 'BlockchainReader/BlockchainReader'
import { BlockchainWriter } from 'BlockchainWriter/BlockchainWriter'
import { Storage } from 'Storage/Storage'
import { View } from 'View/View'

async function main() {
  console.log('Running Po.et Node')
  console.log('Logging Level:', Configuration.loggingLevel)
  console.log('')

  const logger: Pino.Logger = Pino({ level: Configuration.loggingLevel, prettyPrint: Configuration.loggingPretty })

  const api = new API({
    loggingLevel: Configuration.loggingLevel,
    loggingPretty: Configuration.loggingPretty,
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
    dbUrl: Configuration.mongodbUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
    loggingLevel: Configuration.loggingLevel,
    loggingPretty: Configuration.loggingPretty,
  })
  try {
    await view.start()
  } catch (ex) {
    console.log('View was unable to start. Cause was: \n', ex)
  }

  const storage = new Storage({
    dbUrl: Configuration.mongodbUrl,
    ipfsUrl: Configuration.ipfsUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
    downloadIntervalInSeconds: Configuration.downloadIntervalInSeconds,
  })
  try {
    await storage.start()
  } catch (ex) {
    console.log('Storage was unable to start. Cause was: \n', ex)
  }

  if (Configuration.enableTimestamping) {
    const blockchainWriter = new BlockchainWriter({
      dbUrl: Configuration.mongodbUrl,
      rabbitmqUrl: Configuration.rabbitmqUrl,
      insightUrl: Configuration.insightUrl,
      bitcoinAddress: Configuration.bitcoinAddress,
      bitcoinAddressPrivateKey: Configuration.bitcoinAddressPrivateKey,
      poetNetwork: Configuration.poetNetwork,
      poetVersion: Configuration.poetVersion,
      timestampIntervalInSeconds: Configuration.timestampIntervalInSeconds,
      loggingLevel: Configuration.loggingLevel,
      loggingPretty: Configuration.loggingPretty,
    })
    try {
      await blockchainWriter.start()
    } catch (ex) {
      console.log('BlockchainWriter was unable to start. Cause was: \n', ex)
    }
  }

  const blockchainReader = new BlockchainReader({
    dbUrl: Configuration.mongodbUrl,
    rabbitmqUrl: Configuration.rabbitmqUrl,
    insightUrl: Configuration.insightUrl,
    poetNetwork: Configuration.poetNetwork,
    poetVersion: Configuration.poetVersion,
    minimumBlockHeight: Configuration.minimumBlockHeight,
    forceBlockHeight: Configuration.forceBlockHeight,
    blockchainReaderIntervalInSeconds: Configuration.blockchainReaderIntervalInSeconds,
    loggingLevel: Configuration.loggingLevel,
    loggingPretty: Configuration.loggingPretty,
  })
  try {
    await blockchainReader.start()
  } catch (exception) {
    logger.error({ exception }, 'BlockchainReader was unable to start')
  }
}

main().catch(console.error)

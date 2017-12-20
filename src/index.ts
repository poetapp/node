import 'reflect-metadata'

import { Configuration } from 'Configuration'

import { API } from 'API/API'
import { BlockchainReader } from 'BlockchainReader/BlockchainReader'
import { BlockchainWriter } from 'BlockchainWriter/BlockchainWriter'
import { Storage } from 'Storage/Storage'
import { View } from 'View/View'

async function main() {
  console.log('Running Po.et Node')
  console.log('')

  const api = new API({port: Configuration.apiPort, dbUrl: Configuration.mongodbUrl, rabbitmqUrl: Configuration.rabbitmqUrl})
  try {
    await api.start()
  } catch (ex) {
    console.log('API was unable to start. Cause was: \n', ex)
  }

  const view = new View({dbUrl: Configuration.mongodbUrl, rabbitmqUrl: Configuration.rabbitmqUrl})
  try {
    await view.start()
  } catch (ex) {
    console.log('View was unable to start. Cause was: \n', ex)
  }

  const storage = new Storage({dbUrl: Configuration.mongodbUrl, ipfsUrl: Configuration.ipfsUrl, rabbitmqUrl: Configuration.rabbitmqUrl})
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
  })
  try {
    await blockchainReader.start()
  } catch (ex) {
    console.log('BlockchainReader was unable to start. Cause was: \n', ex)
  }
}

main().catch(console.error)

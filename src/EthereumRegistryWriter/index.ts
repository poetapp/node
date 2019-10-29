import 'Extensions/Array'
import 'Extensions/Error'
import 'Extensions/Promise'

import * as Pino from 'pino'

import { catchStartupError } from 'Helpers/moduleStartStopCatch'
import { loadConfigurationWithDefaults } from 'LoadConfiguration'

import { EthereumRegistryWriter } from './EthereumRegistryWriter'

const configuration = loadConfigurationWithDefaults()

const logger: Pino.Logger = Pino({
  level: configuration.loggingLevel,
  prettyPrint: configuration.loggingPretty,
})

const ethereumRegistryWriter = EthereumRegistryWriter({
  loggingLevel: configuration.loggingLevel,
  loggingPretty: configuration.loggingPretty,
  dbUrl: configuration.mongodbUrl,
  rabbitmqUrl: configuration.rabbitmqUrl,
  exchanges: {
    claimIpfsHash: configuration.exchangeClaimIpfsHash,
    ipfsDirectoryCreated: configuration.exchangeBatchWriterCreateNextBatchSuccess,
    ipfsDirectoryRead: configuration.exchangeBatchReaderReadNextDirectorySuccess,
    poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
    claimsDownloaded: configuration.exchangeClaimsDownloaded,
  },
})

process.on('SIGINT', ethereumRegistryWriter.stop)

ethereumRegistryWriter.start()
  .catch(catchStartupError('EthereumRegistryWriter', logger))

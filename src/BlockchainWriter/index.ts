import 'Extensions/Array'
import 'Extensions/Error'
import 'Extensions/Promise'

import Pino from 'pino'

import { catchStartupError } from 'Helpers/moduleStartStopCatch'
import { loadConfigurationWithDefaults } from 'LoadConfiguration'

import { BlockchainWriter } from './BlockchainWriter'

const configuration = loadConfigurationWithDefaults()

const logger: Pino.Logger = Pino({
  level: configuration.loggingLevel,
  prettyPrint: configuration.loggingPretty,
})

const catchBlockchainWriterStartupError = catchStartupError('BlockchainWriter', logger)

const blockchainWriter = new BlockchainWriter({
  loggingLevel: configuration.loggingLevel,
  loggingPretty: configuration.loggingPretty,
  dbUrl: configuration.mongodbUrl,
  rabbitmqUrl: configuration.rabbitmqUrl,
  poetNetwork: configuration.poetNetwork,
  poetVersion: configuration.poetVersion,
  anchorIntervalInSeconds: configuration.anchorIntervalInSeconds,
  purgeStaleTransactionsIntervalInSeconds: configuration.purgeStaleTransactionsIntervalInSeconds,
  maximumTransactionAgeInBlocks: configuration.maximumTransactionAgeInBlocks,
  bitcoinUrl: configuration.bitcoinUrl,
  bitcoinPort: configuration.bitcoinPort,
  bitcoinNetwork: configuration.bitcoinNetwork,
  bitcoinUsername: configuration.bitcoinUsername,
  bitcoinPassword: configuration.bitcoinPassword,
  bitcoinFeeEstimateMode: configuration.bitcoinFeeEstimateMode,
  bitcoinFeeRate: configuration.bitcoinFeeRate,
  exchanges: {
    anchorNextHashRequest: configuration.exchangeAnchorNextHashRequest,
    ipfsHashTxId: configuration.exchangeIpfsHashTxId,
    batchWriterCreateNextBatchSuccess: configuration.exchangeBatchWriterCreateNextBatchSuccess,
    poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
    claimsDownloaded: configuration.exchangeClaimsDownloaded,
    purgeStaleTransactions: configuration.exchangePurgeStaleTransactions,
  },
})

process.on('SIGINT', blockchainWriter.stop)

blockchainWriter.start()
  .catch(catchBlockchainWriterStartupError)

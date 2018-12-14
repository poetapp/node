import * as Pino from 'pino'

import { Configuration } from 'Configuration'
import { catchStartupError, shutdownModule } from 'Helpers/moduleStartStopCatch'
import { loadConfigurationWithDefaults } from 'LoadConfiguration'

import { BlockchainWriter } from './BlockchainWriter'

const defaultConfiguration: Configuration = loadConfigurationWithDefaults()

const logger: Pino.Logger = Pino({
  level: defaultConfiguration.loggingLevel,
  prettyPrint: defaultConfiguration.loggingPretty,
})

const loggingConfiguration = {
  loggingLevel: defaultConfiguration.loggingLevel,
  loggingPretty: defaultConfiguration.loggingPretty,
}

const catchBlockchainWriterStartupError = catchStartupError('BlockchainWriter', logger)

export const blockchainWriter = (localVars: any = {}): BlockchainWriter => {
  const configuration = loadConfigurationWithDefaults(localVars)

  return new BlockchainWriter({
    ...loggingConfiguration,
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
    exchanges: {
      anchorNextHashRequest: configuration.exchangeAnchorNextHashRequest,
      ipfsHashTxId: configuration.exchangeIpfsHashTxId,
      batchWriterCreateNextBatchSuccess: configuration.exchangeBatchWriterCreateNextBatchSuccess,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
      purgeStaleTransactions: configuration.exchangePurgeStaleTransactions,
    },
  })
}

blockchainWriter().start()
  .then(shutdownModule)
  .catch(catchBlockchainWriterStartupError)

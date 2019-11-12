/* tslint:disable:no-console */
import Pino from 'pino'

import 'Extensions/Array'
import 'Extensions/Error'
import 'Extensions/Promise'

import { API } from 'API/API'
import { BatchReader } from 'BatchReader/BatchReader'
import { BatchWriter } from 'BatchWriter/BatchWriter'
import { BlockchainReader } from 'BlockchainReader/BlockchainReader'
import { BlockchainWriter } from 'BlockchainWriter/BlockchainWriter'
import { Configuration } from 'Configuration'
import { Health } from 'Health/Health'
import { loadConfigurationWithDefaults } from 'LoadConfiguration'
import { StorageReader } from 'StorageReader/StorageReader'
import { StorageWriter } from 'StorageWriter/StorageWriter'
import { View } from 'View/View'

const startStopNoop = {
  start: () => Promise.resolve(),
  stop: () => Promise.resolve(),
}

export async function app(localVars: any = {}) {
  console.log('Running Po.et Node')
  console.log('')
  console.log('Loading Configuration...')

  const configuration: Configuration = loadConfigurationWithDefaults(localVars)

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

  const api = API({
    ...loggingConfiguration,
    port: configuration.apiPort,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    exchanges: {
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
      newClaim: configuration.exchangeNewClaim,
    },
    ipfsArchiveUrlPrefix: configuration.ipfsArchiveUrlPrefix,
    ipfsUrl: configuration.ipfsUrl,
  })

  try {
    await api.start()
  } catch (exception) {
    logger.error({ exception }, 'API was unable to start')
  }

  const batchWriter = new BatchWriter({
    ...loggingConfiguration,
    batchCreationIntervalInSeconds: configuration.batchCreationIntervalInSeconds,
    dbUrl: configuration.mongodbUrl,
    ipfs: { url: configuration.ipfsUrl },
    rabbitmqUrl: configuration.rabbitmqUrl,
    exchanges: {
      claimIpfsHash: configuration.exchangeClaimIpfsHash,
      batchWriterCreateNextBatchRequest: configuration.exchangeBatchWriterCreateNextBatchRequest,
      batchWriterCreateNextBatchSuccess: configuration.exchangeBatchWriterCreateNextBatchSuccess,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
    },
  })

  try {
    await batchWriter.start()
  } catch (exception) {
    logger.error({ exception }, 'BatchWriter was unable to start')
  }

  const batchReader = new BatchReader({
    ...loggingConfiguration,
    readNextDirectoryIntervalInSeconds: configuration.readDirectoryIntervalInSeconds,
    dbUrl: configuration.mongodbUrl,
    ipfsUrl: configuration.ipfsUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    exchanges: {
      batchReaderReadNextDirectoryRequest: configuration.exchangeBatchReaderReadNextDirectoryRequest,
      batchReaderReadNextDirectorySuccess: configuration.exchangeBatchReaderReadNextDirectorySuccess,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
    },
  })
  try {
    await batchReader.start()
  } catch (exception) {
    logger.error({ exception }, 'BatchReader was unable to start')
  }

  const view = View({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    exchanges: {
      newClaim: configuration.exchangeNewClaim,
      claimIpfsHash: configuration.exchangeClaimIpfsHash,
      ipfsHashTxId: configuration.exchangeIpfsHashTxId,
      batchReaderReadNextDirectorySuccess: configuration.exchangeBatchReaderReadNextDirectorySuccess,
      batchWriterCreateNextBatchSuccess: configuration.exchangeBatchWriterCreateNextBatchSuccess,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
    },
  })
  try {
    await view.start()
  } catch (exception) {
    logger.error({ exception }, 'View was unable to start')
  }

  const storage = StorageReader({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    ipfsUrl: configuration.ipfsUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    downloadIntervalInSeconds: configuration.downloadIntervalInSeconds,
    downloadRetryDelayInMinutes: configuration.downloadRetryDelayInMinutes,
    downloadMaxAttempts: configuration.downloadMaxAttempts,
    downloadTimeoutInSeconds: configuration.downloadTimeoutInSeconds,
    exchanges: {
      batchReaderReadNextDirectorySuccess: configuration.exchangeBatchReaderReadNextDirectorySuccess,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
      claimsNotDownloaded: configuration.exchangeClaimsNotDownloaded,
    },
  })
  try {
    await storage.start()
  } catch (exception) {
    logger.error({ exception }, 'StorageReader was unable to start')
  }

  const storageWriter = StorageWriter({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    ipfs: { url: configuration.ipfsUrl },
    rabbitmqUrl: configuration.rabbitmqUrl,
    uploadClaimIntervalInSeconds: configuration.uploadClaimIntervalInSeconds,
    maxStorageAttempts: configuration.uploadClaimMaxAttempts,
    exchanges: {
      claimIpfsHash: configuration.exchangeClaimIpfsHash,
      newClaim: configuration.exchangeNewClaim,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
      storageWriterStoreNextClaim: configuration.exchangeStorageWriterStoreNextClaim,
    },
  })

  try {
    await storageWriter.start()
  } catch (exception) {
    logger.error({ exception }, 'StorageWriter was unable to start')
  }

  const blockchainWriter = configuration.enableAnchoring
    ? new BlockchainWriter({
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
    : startStopNoop

  try {
    await blockchainWriter.start()
  } catch (exception) {
    logger.error({ exception }, 'BlockchainWriter was unable to start')
  }

  const blockchainReader = new BlockchainReader({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    bitcoinUrl: configuration.bitcoinUrl,
    bitcoinPort: configuration.bitcoinPort,
    bitcoinNetwork: configuration.bitcoinNetwork,
    bitcoinUsername: configuration.bitcoinUsername,
    bitcoinPassword: configuration.bitcoinPassword,
    poetNetwork: configuration.poetNetwork,
    poetVersion: configuration.poetVersion,
    minimumBlockHeight: configuration.minimumBlockHeight,
    forceBlockHeight: configuration.forceBlockHeight,
    blockchainReaderIntervalInSeconds: configuration.blockchainReaderIntervalInSeconds,
    exchanges: {
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
      claimsDownloaded: configuration.exchangeClaimsDownloaded,
      forkDetected: configuration.exchangeForkDetected,
    },
  })
  try {
    await blockchainReader.start()
  } catch (exception) {
    logger.error({ exception }, 'BlockchainReader was unable to start')
  }

  const health = new Health({
    ...loggingConfiguration,
    dbUrl: configuration.mongodbUrl,
    rabbitmqUrl: configuration.rabbitmqUrl,
    bitcoinUrl: configuration.bitcoinUrl,
    bitcoinPort: configuration.bitcoinPort,
    bitcoinNetwork: configuration.bitcoinNetwork,
    lowWalletBalanceInBitcoin: configuration.lowWalletBalanceInBitcoin,
    ipfsUrl: configuration.ipfsUrl,
    bitcoinUsername: configuration.bitcoinUsername,
    bitcoinPassword: configuration.bitcoinPassword,
    healthIntervalInSeconds: configuration.healthIntervalInSeconds,
    feeEstimateMinTargetBlock: configuration.feeEstimateMinTargetBlock,
    exchanges: {
      getHealth: configuration.exchangeGetHealth,
      claimsNotDownloaded: configuration.exchangeClaimsNotDownloaded,
      ipfsHashTxId: configuration.exchangeIpfsHashTxId,
      poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
    },
  })

  try {
    await health.start()
  } catch (exception) {
    logger.error({ exception }, 'Health was unable to start')
  }

  return {
    stop: async () => {
      logger.info('Po.et node terminating...')

      await api.stop()
      await blockchainReader.stop()
      await batchReader.stop()
      await view.stop()
      await batchWriter.stop()
      await blockchainWriter.stop()
      await storageWriter.stop()
      await storage.stop()
      await health.stop()

      logger.info('Po.et node terminated')
      return true
    },
  }
}

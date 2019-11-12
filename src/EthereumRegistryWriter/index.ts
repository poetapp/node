import 'Extensions/Array'
import 'Extensions/Error'
import 'Extensions/Promise'

import Pino from 'pino'

import { catchStartupError } from 'Helpers/moduleStartStopCatch'
import { loadConfigurationWithDefaults } from 'LoadConfiguration'

import { EthereumRegistryWriter } from './EthereumRegistryWriter'

const configuration = loadConfigurationWithDefaults()

const logger: Pino.Logger = Pino({
  level: configuration.loggingLevel,
  prettyPrint: configuration.loggingPretty,
})

EthereumRegistryWriter({
  loggingLevel: configuration.loggingLevel,
  loggingPretty: configuration.loggingPretty,
  mongodbUrl: configuration.mongodbUrl,
  rabbitmqUrl: configuration.rabbitmqUrl,
  ipfs: {
    url: configuration.ipfsUrl,
  },
  exchanges: {
    claimIpfsHash: configuration.exchangeClaimIpfsHash,
    batchCreated: configuration.exchangeBatchWriterCreateNextBatchSuccess,
    batchRead: configuration.exchangeBatchReaderReadNextDirectorySuccess,
    poetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
    claimsDownloaded: configuration.exchangeClaimsDownloaded,
  },
  rpcUrl: configuration.ethereumRpcUrl,
  chainId: configuration.ethereumChainId,
  contractAddress: configuration.ethereumRegistryContractAddress,
  privateKey: configuration.ethereumRegistryPrivateKey,
  uploadAnchorReceiptIntervalInSeconds: configuration.ethereumRegistryUploadAnchorReceiptIntervalInSeconds,
  registerNextDirectoryIntervalInSeconds: configuration.ethereumRegistryRegisterNextDirectoryIntervalInSeconds,
})
  .then(stop => process.on('SIGINT', stop))
  .catch(catchStartupError('EthereumRegistryWriter', logger))

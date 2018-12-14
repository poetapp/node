export interface Configuration extends LoggingConfiguration, BitcoinRPCConfiguration, ExchangeConfiguration {
  readonly rabbitmqUrl: string
  readonly exchangePrefix: string
  readonly mongodbUser: string
  readonly mongodbPassword: string
  readonly mongodbHost: string
  readonly mongodbPort: number
  readonly mongodbDatabase: string
  readonly mongodbUrl: string
  readonly ipfsUrl: string
  readonly ipfsArchiveUrlPrefix: string

  readonly apiPort: number

  readonly poetNetwork: string
  readonly poetVersion: number

  readonly blockchainReaderIntervalInSeconds: number
  readonly minimumBlockHeight: number
  readonly forceBlockHeight?: number

  readonly enableAnchoring: boolean
  readonly anchorIntervalInSeconds: number
  readonly purgeStaleTransactionsIntervalInSeconds: number
  readonly maximumTransactionAgeInBlocks: number

  readonly healthIntervalInSeconds: number
  readonly lowWalletBalanceInBitcoin: number
  readonly feeEstimateMinTargetBlock: number

  readonly downloadIntervalInSeconds: number
  readonly downloadRetryDelayInMinutes: number
  readonly downloadMaxAttempts: number
  readonly downloadTimeoutInSeconds: number

  readonly batchCreationIntervalInSeconds: number
  readonly transactionMaxAgeInSeconds: number

  readonly readDirectoryIntervalInSeconds: number

  readonly uploadClaimIntervalInSeconds: number
  readonly uploadClaimMaxAttempts: number
}

export interface LoggingConfiguration {
  readonly loggingLevel: string
  readonly loggingPretty: boolean
}

export interface BitcoinRPCConfiguration {
  readonly bitcoinUrl: string
  readonly bitcoinPort: number
  readonly bitcoinNetwork: string
  readonly bitcoinUsername: string
  readonly bitcoinPassword: string
}

export interface ExchangeConfiguration {
  readonly exchangeAnchorNextHashRequest: string
  readonly exchangeBatchReaderReadNextDirectoryRequest: string
  readonly exchangeBatchReaderReadNextDirectorySuccess: string
  readonly exchangeBatchWriterCreateNextBatchRequest: string
  readonly exchangeBatchWriterCreateNextBatchSuccess: string
  readonly exchangeNewClaim: string
  readonly exchangeClaimIpfsHash: string
  readonly exchangeIpfsHashTxId: string
  readonly exchangePoetAnchorDownloaded: string
  readonly exchangeClaimsDownloaded: string
  readonly exchangeClaimsNotDownloaded: string
  readonly exchangeStorageWriterStoreNextClaim: string
  readonly exchangeGetHealth: string
  readonly exchangePurgeStaleTransactions: string
  readonly exchangeForkDetected: string
}

export const DefaultConfiguration: Configuration = {
  rabbitmqUrl: 'amqp://admin:adminPass@localhost',
  exchangePrefix: '',
  mongodbUser: '',
  mongodbPassword: '',
  mongodbHost: 'localhost',
  mongodbPort: 27017,
  mongodbDatabase: 'poet',
  mongodbUrl: 'mongodb://localhost:27017/poet',
  ipfsUrl: 'http://localhost:5001',
  ipfsArchiveUrlPrefix: 'https://ipfs.io/ipfs',
  bitcoinUrl: '127.0.0.1',
  bitcoinPort: 18443,
  bitcoinNetwork: 'regtest',
  bitcoinUsername: 'bitcoinrpcuser',
  bitcoinPassword: 'bitcoinrpcpassword',

  apiPort: 18080,
  poetNetwork: 'POET',
  poetVersion: 0,
  minimumBlockHeight: 100,
  blockchainReaderIntervalInSeconds: 5,

  enableAnchoring: false,
  anchorIntervalInSeconds: 30,
  purgeStaleTransactionsIntervalInSeconds: 600,
  maximumTransactionAgeInBlocks: 25,

  healthIntervalInSeconds: 30,
  lowWalletBalanceInBitcoin: 1,
  feeEstimateMinTargetBlock: 1,

  downloadIntervalInSeconds: 5,
  downloadRetryDelayInMinutes: 10,
  downloadMaxAttempts: 20,
  downloadTimeoutInSeconds: 10,

  loggingLevel: 'info',
  loggingPretty: true,

  batchCreationIntervalInSeconds: 600,
  transactionMaxAgeInSeconds: 1800,

  readDirectoryIntervalInSeconds: 30,

  uploadClaimIntervalInSeconds: 30,
  uploadClaimMaxAttempts: 10,

  forceBlockHeight: undefined,

  exchangeAnchorNextHashRequest: 'ANCHOR_NEXT_HASH_REQUEST',
  exchangeBatchReaderReadNextDirectoryRequest: 'BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
  exchangeBatchReaderReadNextDirectorySuccess: 'BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
  exchangeBatchWriterCreateNextBatchRequest: 'BATCH_WRITER::CREATE_NEXT_BATCH_REQUEST',
  exchangeBatchWriterCreateNextBatchSuccess: 'BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',
  exchangeNewClaim: 'NEW_CLAIM',
  exchangeClaimIpfsHash: 'CLAIM_IPFS_HASH',
  exchangeIpfsHashTxId: 'IPFS_HASH_TX_ID',
  exchangePoetAnchorDownloaded: 'POET_ANCHOR_DOWNLOADED',
  exchangeClaimsDownloaded: 'CLAIMS_DOWNLOADED',
  exchangeClaimsNotDownloaded: 'CLAIMS_NOT_DOWNLOADED',
  exchangeStorageWriterStoreNextClaim: 'STORAGE_WRITER::STORE_NEXT_CLAIM',
  exchangeGetHealth: 'HEALTH::GET_HEALTH',
  exchangePurgeStaleTransactions: 'BLOCK_WRITER::PURGE_STALE_TRANSACTIONS',
  exchangeForkDetected: 'FORK_DETECTED',
}

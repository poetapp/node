/* tslint:disable:no-relative-imports */
/* tslint:disable:no-console */
import * as assert from 'assert'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import { keys } from 'ramda'

import { createEnvToConfigurationKeyMap } from 'Helpers/Configuration'

const defaultMongodbUrl = 'mongodb://localhost:27017/poet'

// Provide default value in defaultConfiguration for any new configuration options
export interface Configuration extends LoggingConfiguration, BitcoinRPCConfiguration, RabbitmqExchangeMessages {
  readonly rabbitmqUrl: string
  readonly mongodbUser: string
  readonly mongodbPassword: string
  readonly mongodbHost: string
  readonly mongodbPort: number
  readonly mongodbDatabase: string
  readonly mongodbUrl: string
  readonly ipfsUrl: string

  readonly apiPort: number

  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>

  readonly blockchainReaderIntervalInSeconds: number
  readonly minimumBlockHeight: number
  readonly forceBlockHeight?: number

  readonly enableTimestamping: boolean
  readonly timestampIntervalInSeconds: number

  readonly downloadIntervalInSeconds: number
  readonly downloadRetryDelayInMinutes: number
  readonly downloadMaxAttempts: number
  readonly downloadTimeoutInSeconds: number

  readonly batchCreationIntervalInSeconds: number

  readonly readDirectoryIntervalInSeconds: number
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

export interface RabbitmqExchangeMessages {
  readonly batchReaderReadNextDirectoryRequest: string
  readonly batchReaderReadNextDirectorySuccess: string
  readonly batchWriterCreateNextBatchRequest: string
  readonly batchWriterCreateNextBatchSuccess: string
  readonly newClaim: string
  readonly claimIpfsHash: string
  readonly ipfsHashTxId: string
  readonly poetAnchorDownloaded: string
  readonly claimsDownloaded: string
}

const defaultConfiguration: Configuration = {
  rabbitmqUrl: 'amqp://localhost',
  mongodbUser: '',
  mongodbPassword: '',
  mongodbHost: 'localhost',
  mongodbPort: 27017,
  mongodbDatabase: 'poet',
  mongodbUrl: defaultMongodbUrl,
  ipfsUrl: 'http://localhost:5001',
  bitcoinUrl: '127.0.0.1',
  bitcoinPort: 18443,
  bitcoinNetwork: 'regtest',
  bitcoinUsername: 'bitcoinrpcuser',
  bitcoinPassword: 'bitcoinrpcpassword',

  apiPort: 18080,
  poetNetwork: 'BARD',
  poetVersion: [0, 3],
  minimumBlockHeight: 1279550, // Less than 24 hours before Feb 8th, 2018 - Frost's Release
  blockchainReaderIntervalInSeconds: 5,

  enableTimestamping: false,
  timestampIntervalInSeconds: 30,

  downloadIntervalInSeconds: 5,
  downloadRetryDelayInMinutes: 10,
  downloadMaxAttempts: 20,
  downloadTimeoutInSeconds: 10,

  loggingLevel: 'info',
  loggingPretty: true,

  batchCreationIntervalInSeconds: 600,

  readDirectoryIntervalInSeconds: 30,

  forceBlockHeight: undefined,

  batchReaderReadNextDirectoryRequest: 'BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
  batchReaderReadNextDirectorySuccess: 'BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
  batchWriterCreateNextBatchRequest: 'BATCH_WRITER::CREATE_NEXT_BATCH_REQUEST',
  batchWriterCreateNextBatchSuccess: 'BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',
  newClaim: 'NEW_CLAIM',
  claimIpfsHash: 'CLAIM_IPFS_HASH',
  ipfsHashTxId: 'IPFS_HASH_TX_ID',
  poetAnchorDownloaded: 'POET_ANCHOR_DOWNLOADED',

  claimsDownloaded: 'CLAIMS_DOWNLOADED',
}

export const configurationPath = () => path.join(homedir(), '/.po.et/configuration.json')

export const mergeConfigs = (localVars: any = {}) => {
  const config = {
    ...defaultConfiguration,
    ...loadConfigurationFromEnv(localVars),
    ...loadConfigurationFromFile(configurationPath()),
  }
  // TODO: This is here to support using either MONGODB_URL or MONGO_HOST, MONGO_PORT, etc.
  // Remove this once local-dev switches over to using the individual env vars.
  if (config.mongodbUrl === defaultMongodbUrl) {
    const mongoAuth = config.mongodbUser !== '' ? `${config.mongodbUser}:${config.mongodbPassword}@` : ''
    config.mongodbUrl = `mongodb://${mongoAuth}${config.mongodbHost}:${config.mongodbPort}/${config.mongodbDatabase}`
  }

  return config
}

export const loadConfigurationWithDefaults = (localVars: any = {}) => mergeConfigs({ ...process.env, ...localVars })

function loadConfigurationFromFile(configPath: string): Configuration | {} {
  if (!existsSync(configPath)) {
    console.log('File', configPath, 'not found')
    return {}
  }

  const configuration = JSON.parse(readFileSync(configPath, 'utf8'))

  console.log('Loaded configuration from ' + configPath)

  if (typeof configuration.poetNetwork === 'string') validatePoetNetwork(configuration.poetNetwork)

  if (typeof configuration.poetVersion === 'object') validatePoetVersion(configuration.poetVersion)

  return configuration
}

function loadConfigurationFromEnv(env: any): Partial<Configuration> {
  const map = createEnvToConfigurationKeyMap(keys(defaultConfiguration))

  const configurationFromEnv = Object.entries(env)
    .filter(([key, value]) => map[key])
    .reduce(
      (previousValue, [key, value]: [string, any]) => ({
        ...previousValue,
        [map[key]]: isNaN(value) ? value : parseInt(value, 10),
      }),
      {}
    )

  return configurationFromEnv
}

function validatePoetVersion(poetVersion: any) {
  assert(Array.isArray(poetVersion), 'Field poetVersion must be an Array')
  assert(poetVersion.length === 4, 'Field poetVersion must have 4 elements')
  poetVersion.forEach((element: any) =>
    assert(
      Number.isInteger(element) && 0 <= element && element < 256,
      'Each member of poetVersion must be an integer between 0 and 255'
    )
  )
}

function validatePoetNetwork(poetNetwork: any) {
  assert(poetNetwork === 'BARD' || poetNetwork === 'POET', 'Field poetNetwork must be equal to BARD or POET')
}

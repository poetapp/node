/* tslint:disable:no-console */
import * as assert from 'assert'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import { keys } from 'ramda'

import { createEnvToConfigurationKeyMap } from 'Helpers/Configuration'

// Provide default value in defaultConfiguration for any new configuration options
export interface Configuration extends LoggingConfiguration, BitcoinRPCConfiguration {
  readonly rabbitmqUrl: string
  readonly mongodbUrl: string
  readonly ipfsUrl: string
  readonly insightUrl: string

  readonly apiPort: number
  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>
  readonly minimumBlockHeight: number
  readonly blockchainReaderIntervalInSeconds: number
  readonly forceBlockHeight?: number

  readonly enableTimestamping: boolean
  readonly bitcoinAddress: string
  readonly bitcoinAddressPrivateKey: string
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

const defaultConfiguration: Configuration = {
  rabbitmqUrl: 'amqp://localhost',
  mongodbUrl: 'mongodb://localhost:27017/poet',
  ipfsUrl: 'http://localhost:5001',
  insightUrl: 'https://test-insight.bitpay.com/api',
  bitcoinUrl: '127.0.0.1',
  bitcoinPort: 18332,
  bitcoinNetwork: 'testnet',
  bitcoinUsername: 'bitcoinrpcuser',
  bitcoinPassword: 'bitcoinrpcpassword',

  apiPort: 18080,
  poetNetwork: 'BARD',
  poetVersion: [0, 0, 0, 3],
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
  bitcoinAddress: undefined,
  bitcoinAddressPrivateKey: undefined,
}

export const configurationPath = () => path.join(homedir(), '/.po.et/configuration.json')

export function loadConfigurationWithDefaults(): Configuration {
  return {
    ...defaultConfiguration,
    ...loadConfigurationFromEnv(),
    ...loadConfigurationFromFile(configurationPath()),
  }
}

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

function loadConfigurationFromEnv(): Partial<Configuration> {
  const map = createEnvToConfigurationKeyMap(keys(defaultConfiguration))

  const configurationFromEnv = Object.entries(process.env)
    .filter(([key, value]) => map[key])
    .reduce((previousValue, [key, value]) => ({ ...previousValue, [map[key]]: value }), {})

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

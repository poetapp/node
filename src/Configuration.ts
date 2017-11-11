import * as assert from 'assert'
import { readFileSync, existsSync } from 'fs'

export interface Configuration {
  readonly rabbitmqUrl: string
  readonly mongodbUrl: string
  readonly ipfsUrl: string
  readonly insightUrl: string
  readonly s3Url?: string

  readonly apiPort: number
  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>
  readonly minimumBlockHeight: number

  readonly enableTimestamping?: boolean
  readonly bitcoinAddress?: string
  readonly bitcoinAddressPrivateKey?: string
}

const defaultConfiguration: Configuration = {
  rabbitmqUrl: 'amqp://localhost',
  mongodbUrl: 'mongodb://localhost:27017/poet',
  ipfsUrl: 'http://localhost:5001',
  insightUrl: 'https://test-insight.bitpay.com/api',

  apiPort: 8080,
  poetNetwork: 'BARD',
  poetVersion: [0, 0, 0, 2],
  minimumBlockHeight: 1225900,

  enableTimestamping: false
}

function loadConfigurationWithDefaults(): Configuration {
  console.log('Loading Po.et Configuration')

  const path = '~/.po.et/configuration.json'

  return { ...defaultConfiguration, ...loadConfiguration(path) }
}

function loadConfiguration(path: string): Configuration | {} {
  console.log('Loading Po.et Configuration From File')

  if (!existsSync(path))
    return {}

  const configuration = JSON.parse(readFileSync(path, 'utf8'))

  if (typeof configuration.poetNetwork === 'string')
    validatePoetNetwork(configuration.poetNetwork)

  if (typeof configuration.poetVersion === 'object')
    validatePoetVersion(configuration.poetVersion)

  return configuration
}

function validatePoetVersion(poetVersion: any) {
  assert(Array.isArray(poetVersion), 'Field poetVersion must be an Array')
  assert(poetVersion.length === 4, 'Field poetVersion must have 4 elements')
  poetVersion.forEach((element: any) => assert(Number.isInteger(element) && 0 <= element && element < 256,
    'Each member of poetVersion must be an integer between 0 and 255'))
}

function validatePoetNetwork(poetNetwork: any) {
  assert(poetNetwork === 'BARD' || poetNetwork === 'POET', 'Field poetVersion must be equal to BARD or POET')
}

export const Configuration = loadConfigurationWithDefaults()

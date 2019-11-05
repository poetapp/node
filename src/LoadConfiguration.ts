/* tslint:disable:no-relative-imports */
import assert from 'assert'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import { keys, pipe } from 'ramda'

import { DefaultConfiguration, Configuration } from 'Configuration'
import { createEnvToConfigurationKeyMap } from 'Helpers/Configuration'

export const configurationPath = () => path.join(homedir(), '/.po.et/configuration.json')

export const mergeConfigs = (localVars: any = {}) => {
  const config = {
    ...DefaultConfiguration,
    ...loadConfigurationFromEnv(localVars),
    ...loadConfigurationFromFile(configurationPath()),
  }

  // Support setting MONGODB_URL all at once or via separate variables.
  // Especially needed for production since the schema is different (mongodb+srv) and
  // there's currently no override for that.
  if (config.mongodbUrl === DefaultConfiguration.mongodbUrl) {
    const mongoAuth = config.mongodbUser !== '' ? `${config.mongodbUser}:${config.mongodbPassword}@` : ''
    config.mongodbUrl = `mongodb://${mongoAuth}${config.mongodbHost}:${config.mongodbPort}/${config.mongodbDatabase}`
  }

  return config
}

const prependPrefix = (prefix: string, configVars: any) => (acc: any, k: string) => ({
  ...acc,
  [k]: `${prefix}.${configVars[k]}`,
})

export const applyExchangePrefix = (configVars: any) => {
  if (configVars.exchangePrefix === '') return configVars

  const exchangeNames = [
    'exchangeAnchorNextHashRequest',
    'exchangeBatchReaderReadNextDirectoryRequest',
    'exchangeBatchReaderReadNextDirectorySuccess',
    'exchangeBatchWriterCreateNextBatchRequest',
    'exchangeBatchWriterCreateNextBatchSuccess',
    'exchangeNewClaim',
    'exchangeClaimIpfsHash',
    'exchangeIpfsHashTxId',
    'exchangePoetAnchorDownloaded',
    'exchangeClaimsDownloaded',
    'exchangeClaimsNotDownloaded',
    'exchangeStorageWriterStoreNextClaim',
    'exchangeGetHealth',
    'exchangePurgeStaleTransactions',
    'exchangeForkDetected',
  ]

  return {
    ...configVars,
    ...exchangeNames.reduce(prependPrefix(configVars.exchangePrefix, configVars), {}),
  }
}

export const loadConfigurationWithDefaults = (localVars: any = {}) =>
  pipe(
    mergeConfigs,
    applyExchangePrefix,
  )({ ...process.env, ...localVars })

const loadConfigurationFromFile = (configPath: string): Configuration | {} => {
  if (!existsSync(configPath)) return {}

  const configuration = JSON.parse(readFileSync(configPath, 'utf8'))

  if (configuration.poetNetwork) validatePoetNetwork(configuration.poetNetwork)
  if (configuration.poetVersion) validatePoetVersion(configuration.poetVersion)

  return configuration
}

export const extractValue = (value: any) => {
  const coercedValue = value === 'true' ? true : value === 'false' ? false : value

  return isNaN(coercedValue)
    ? coercedValue
    : typeof coercedValue === 'boolean'
      ? coercedValue
      : parseInt(coercedValue, 10)
}

const loadConfigurationFromEnv = (env: any): Partial<Configuration> => {
  const map = createEnvToConfigurationKeyMap(keys(DefaultConfiguration))

  const configurationFromEnv = Object.entries(env)
    .filter(([key, value]) => map[key])
    .reduce(
      (previousValue, [key, value]: [string, any]) => ({
        ...previousValue,
        [map[key]]: extractValue(value),
      }),
      {},
    )

  return configurationFromEnv
}

export const validatePoetVersion = (poetVersion: number) => {
  assert(
    Number.isInteger(poetVersion) && 0 <= poetVersion && poetVersion <= 0xFFFF,
    'poetVersion must be an integer between 0 and 65535',
  )
}

export const validatePoetNetwork = (poetNetwork: string) => {
  assert(typeof poetNetwork === 'string', 'Field poetNetwork must be a string')
  assert(poetNetwork.length === 4, 'Field poetNetwork must have a length of 4')
}

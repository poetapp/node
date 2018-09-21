import { fromPairs, map, pipe } from 'ramda'

import { BitcoinRPCConfiguration } from 'Configuration'

import { camelCaseToScreamingSnakeCase } from './camelCaseToScreamingSnakeCase'

const toPair = (s: string) => [camelCaseToScreamingSnakeCase(s), s]

export const createEnvToConfigurationKeyMap: (keys: ReadonlyArray<string>) => { [index: string]: string } = pipe(
  map(toPair),
  fromPairs
)

export const bitcoinRPCConfigurationToBitcoinCoreArguments = (configuration: BitcoinRPCConfiguration) => ({
  host: configuration.bitcoinUrl,
  port: configuration.bitcoinPort,
  network: configuration.bitcoinNetwork,
  username: configuration.bitcoinUsername,
  password: configuration.bitcoinPassword,
})

import { keys, fromPairs, map, pipe } from 'ramda'

import { camelCaseToScreamingSnakeCase } from './camelCaseToScreamingSnakeCase'

export const toPair = (s: string) => [camelCaseToScreamingSnakeCase(s), s]

export const createEnvToConfigurationKeyMap = pipe(
  keys,
  map(toPair),
  fromPairs
)

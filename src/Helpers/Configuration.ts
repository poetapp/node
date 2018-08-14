import { fromPairs, map, pipe } from 'ramda'

import { camelCaseToScreamingSnakeCase } from './camelCaseToScreamingSnakeCase'

const toPair = (s: string) => [camelCaseToScreamingSnakeCase(s), s]

export const createEnvToConfigurationKeyMap: (keys: ReadonlyArray<string>) => { [index: string]: string } = pipe(
  map(toPair),
  fromPairs
)

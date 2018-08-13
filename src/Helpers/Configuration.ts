import { fromPairs } from 'ramda'

export const ArrayKeyToScreamingSnakeCase = ([key]: ReadonlyArray<string> = []) =>
  key ? [key.replace(/([A-Z])/g, capital => '_' + capital).toUpperCase(), key] : []

export const createEnvToConfigurationKeyMap = (object: object = {}): {} =>
  fromPairs(Object.entries(object).map(ArrayKeyToScreamingSnakeCase))

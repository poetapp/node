import { fromPairs } from 'ramda'

export const toScreamingSnakeCase = (camelCase: string = '') =>
  camelCase.replace(/([A-Z])/g, capital => '_' + capital).toUpperCase()

export const createEnvToConfigurationKeyMap = (object: object = {}): {} =>
  fromPairs(Object.entries(object).map(([key]) => [toScreamingSnakeCase(key), key]))

import 'Extensions/Array'

export const ArrayKeyToScreamingSnakeCase = ([key]: ReadonlyArray<string> = []) =>
  key ? [key.replace(/([A-Z])/g, capital => '_' + capital).toUpperCase(), key] : []

export const createEnvToConfigurationKeyMap = (object: object = {}): {} =>
  Object.entries(object)
    .map(ArrayKeyToScreamingSnakeCase)
    .toObject()

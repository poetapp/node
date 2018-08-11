import 'Extensions/Array'

export const keysToScreamingSnakeCase = (object: object = {}): {} =>
  Object.entries(object)
    .map(([key]) => [key.replace(/([A-Z])/g, capital => '_' + capital).toUpperCase(), key])
    .toObject()

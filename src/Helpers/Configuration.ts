import 'Extensions/Array'

export const keysToScreamingSnakeCase = (object: Object = {}): {} =>
  Object.entries(object)
    .map(([key]) => [key.replace(/([A-Z])/g, (capital) => "_" + capital).toUpperCase(), key]).toObject()
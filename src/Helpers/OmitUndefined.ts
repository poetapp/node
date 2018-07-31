// tslint:disable-next-line
import '../Extensions/Array'

export const omitUndefined = (data: object): object =>
  Object.entries(data)
    .filter(([key, value]) => value !== undefined)
    .toObject()

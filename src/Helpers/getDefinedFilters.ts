// tslint:disable-next-line
import '../Extensions/Array'

interface Query {
  readonly publicKey?: string
  readonly offset?: string
}

export const getDefinedFilters = (worksFilters: Query = {}): Query => {
  const definedFilters = Object.entries(worksFilters)
    .filter(([key, value]) => value !== undefined)
    .toObject()
  return definedFilters
}

export const omitUndefined = (data: Query): Query =>
  Object.entries(data)
    .filter(([key, value]) => value !== undefined)
    .toObject()

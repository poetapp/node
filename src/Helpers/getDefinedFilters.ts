// tslint:disable-next-line
import '../Extensions/Array'

interface Query {
  readonly publicKey?: string
  readonly offset?: string
}

const filters: ReadonlyArray<string> = ['publicKey']

export const getDefinedFilters = (worksFilters: Query = {}): Query =>
  Object.entries(worksFilters)
    .filter(([key, value]) => value !== undefined && filters.includes(key))
    .toObject()

export const omitUndefined = (data: Query): Query =>
  Object.entries(data)
    .filter(([key, value]) => value !== undefined)
    .toObject()

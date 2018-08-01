// tslint:disable-next-line
import 'Extensions/Array'

interface WorksFilters {
  readonly publicKey?: string
  readonly offset?: string
}

const filters: ReadonlyArray<string> = ['publicKey']

export const getDefinedFilters = (worksFilters: WorksFilters = {}): WorksFilters =>
  Object.entries(worksFilters)
    .filter(([key, value]) => value !== undefined && filters.includes(key))
    .toObject()

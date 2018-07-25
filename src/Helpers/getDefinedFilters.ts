import '../Extensions/Array'

interface Query {
  readonly publicKey?: string
}

export const getDefinedFilters = (worksFilters: Query = {}): Query => {
  const definedFilters = Object.entries(worksFilters)
    .filter(([key, value]) => value !== undefined)
    .toObject()
  return definedFilters
}

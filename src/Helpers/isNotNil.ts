import { isNil, not, pipe } from 'ramda'

export const isNotNil = pipe(
  isNil,
  not,
)

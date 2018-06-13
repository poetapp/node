import { FetchError } from 'node-fetch'

// TODO: make PR to node-fetch with this enum
export enum FetchErrorType {
  RequestTimeout = 'request-timeout',
  BodyTimeout = 'body-timeout',
  System = 'system',
  NoRedirect = 'no-redirect',
  MaxRedirect = 'max-redirect',
  UnsupportedRedirect = 'unsupported-redirect',
  MaxSize = 'max-size',
  InvalidJson = 'invalid-json',
}

const TimeoutFetchErrorTypes: ReadonlyArray<string> = [FetchErrorType.RequestTimeout, FetchErrorType.BodyTimeout]

export const isFetchError = (error: any): error is FetchError => error instanceof Error && error.name === 'FetchError'

export const isFetchTimeoutError = (error: Error) => isFetchError(error) && TimeoutFetchErrorTypes.includes(error.type)

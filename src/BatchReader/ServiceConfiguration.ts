import { ExchangeConfiguration } from './ExchangeConfiguration'
export interface ServiceConfiguration extends ExchangeConfiguration {
  readonly readNextDirectoryIntervalInSeconds: number
}

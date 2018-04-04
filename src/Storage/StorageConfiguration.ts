import { ServiceConfiguration } from './ServiceConfiguration'

export interface StorageConfiguration extends ServiceConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

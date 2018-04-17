import { LoggingConfiguration } from 'Configuration'

import { ServiceConfiguration } from './ServiceConfiguration'

export interface StorageConfiguration extends LoggingConfiguration, ServiceConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

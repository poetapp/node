import { LoggingConfiguration } from 'Configuration'

import { DatabaseConfiguration } from './DatabaseConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BatchReaderConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    IPFSConfiguration,
    DatabaseConfiguration {
  readonly rabbitmqUrl: string
}

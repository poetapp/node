import { LoggingConfiguration } from 'Configuration'

import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BatchReaderConfiguration extends LoggingConfiguration, ServiceConfiguration, IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

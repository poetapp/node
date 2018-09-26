import { LoggingConfiguration } from 'Configuration'

import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'
import { Exchange } from './Exchange'

export interface BatchReaderConfiguration extends LoggingConfiguration, ServiceConfiguration, IPFSConfiguration, Exchange {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

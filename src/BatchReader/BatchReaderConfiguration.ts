import { LoggingConfiguration } from 'Configuration'

import { Exchange } from './Exchange'
import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BatchReaderConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    IPFSConfiguration,
    Exchange {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

import { LoggingConfiguration } from 'Configuration'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BatchReaderConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    IPFSConfiguration,
    ExchangeConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

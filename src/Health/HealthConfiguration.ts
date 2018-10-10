import { LoggingConfiguration, BitcoinRPCConfiguration } from 'Configuration'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { HealthServiceConfiguration } from './HealthServiceConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'

export interface HealthConfiguration
  extends LoggingConfiguration,
    BitcoinRPCConfiguration,
    HealthServiceConfiguration,
    IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'

import { ControllerConfiguration } from './ControllerConfiguration'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BlockchainWriterConfiguration
  extends LoggingConfiguration,
    ControllerConfiguration,
    ServiceConfiguration,
    BitcoinRPCConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'

import { ControllerConfiguration } from './ControllerConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BlockchainWriterConfiguration
  extends LoggingConfiguration,
    ControllerConfiguration,
    ServiceConfiguration,
    BitcoinRPCConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

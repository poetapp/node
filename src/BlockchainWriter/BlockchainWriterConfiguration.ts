import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BlockchainWriterConfiguration
  extends LoggingConfiguration,
    ClaimControllerConfiguration,
    ServiceConfiguration,
    BitcoinRPCConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

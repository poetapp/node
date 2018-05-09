import { LoggingConfiguration } from 'Configuration'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BlockchainWriterConfiguration
  extends LoggingConfiguration,
    ClaimControllerConfiguration,
    ServiceConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly insightUrl: string
}

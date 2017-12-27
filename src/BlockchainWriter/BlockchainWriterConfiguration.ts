import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface BlockchainWriterConfiguration extends ClaimControllerConfiguration, ServiceConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly insightUrl: string
}

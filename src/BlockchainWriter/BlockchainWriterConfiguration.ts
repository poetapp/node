import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

export interface BlockchainWriterConfiguration extends ClaimControllerConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly insightUrl: string
}

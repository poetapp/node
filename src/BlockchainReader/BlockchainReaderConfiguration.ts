import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

export interface BlockchainReaderConfiguration extends ClaimControllerConfiguration, BlockchainReaderServiceConfiguration {
  readonly loggingLevel: string
  readonly loggingPretty: boolean
  readonly rabbitmqUrl: string
  readonly dbUrl: string
  readonly insightUrl: string
}

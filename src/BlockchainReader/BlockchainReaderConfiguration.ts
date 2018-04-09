import { LoggingConfiguration } from 'Configuration'

import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

export interface BlockchainReaderConfiguration extends LoggingConfiguration, ClaimControllerConfiguration, BlockchainReaderServiceConfiguration {
  readonly rabbitmqUrl: string
  readonly dbUrl: string
  readonly insightUrl: string
}

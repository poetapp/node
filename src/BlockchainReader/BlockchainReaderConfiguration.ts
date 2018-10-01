import { BitcoinRPCConfiguration, LoggingConfiguration } from 'Configuration'

import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface BlockchainReaderConfiguration
  extends LoggingConfiguration,
    ClaimControllerConfiguration,
    BlockchainReaderServiceConfiguration,
    BitcoinRPCConfiguration {
  readonly rabbitmqUrl: string
  readonly dbUrl: string
  readonly exchanges: ExchangeConfiguration
}

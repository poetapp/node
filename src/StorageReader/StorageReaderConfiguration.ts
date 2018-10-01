import { LoggingConfiguration } from 'Configuration'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface StorageReaderConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    ClaimControllerConfiguration,
    IPFSConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

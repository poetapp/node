import { LoggingConfiguration } from 'Configuration'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

export interface StorageConfiguration
  extends LoggingConfiguration,
    ServiceConfiguration,
    ClaimControllerConfiguration,
    IPFSConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

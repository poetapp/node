import { LoggingConfiguration } from 'Configuration'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'

export interface StorageWriterConfiguration extends LoggingConfiguration, IPFSConfiguration {
  readonly ipfsUrl: string
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

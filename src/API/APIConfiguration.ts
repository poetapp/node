import { LoggingConfiguration } from 'Configuration'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFSConfiguration } from './IPFSConfiguration'

export interface APIConfiguration extends LoggingConfiguration, IPFSConfiguration {
  readonly port: number
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

import { LoggingConfiguration } from 'Configuration'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface APIConfiguration extends LoggingConfiguration {
  readonly port: number
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

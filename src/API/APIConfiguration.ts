import { LoggingConfiguration } from 'Configuration'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { HealthControllerConfiguration } from './HealthControllerConfiguration'

export interface APIConfiguration extends LoggingConfiguration, HealthControllerConfiguration {
  readonly port: number
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

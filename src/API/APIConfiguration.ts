import { LoggingConfiguration } from 'Configuration'

export interface APIConfiguration extends LoggingConfiguration {
  readonly port: number
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

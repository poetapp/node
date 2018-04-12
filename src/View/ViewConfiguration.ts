import { LoggingConfiguration } from 'Configuration'

export interface ViewConfiguration extends LoggingConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
}

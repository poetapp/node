import { LoggingConfiguration } from 'Configuration'

import { IPFSConfiguration } from './IPFSConfiguration'

export interface BatchWriterConfiguration extends LoggingConfiguration, IPFSConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly createNextBatchIntervalInSeconds: number
}

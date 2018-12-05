import { Interval } from '@po.et/poet-js'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface ServiceConfiguration {
  readonly readNextDirectoryIntervalInSeconds: number
}

export interface Dependencies {
  readonly messaging: Messaging
  readonly logger: Pino.Logger
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: ServiceConfiguration
  readonly exchange: ExchangeConfiguration
}

export class Service {
  private readonly interval: Interval
  private readonly messaging: Messaging
  private readonly logger: Pino.Logger
  private readonly exchange: ExchangeConfiguration

  constructor({
    dependencies: {
      logger,
      messaging,
    },
    configuration,
    exchange,
  }: Arguments) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.exchange = exchange
    this.interval = new Interval(
      this.readNextDirectory,
      secondsToMiliseconds(configuration.readNextDirectoryIntervalInSeconds),
    )
  }

  start() {
    this.interval.start()
  }

  stop() {
    this.logger.info('BatchReader Service stopping')
    this.interval.stop()
  }

  private readNextDirectory = async () => {
    const logger = this.logger.child({ method: 'readNextDirectory' })
    try {
      await this.messaging.publish(this.exchange.batchReaderReadNextDirectoryRequest, '')
    } catch (error) {
      logger.error({ error }, 'Uncaught exception in BatchReader Service')
    }
  }
}

import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class Service {
  private readonly interval: Interval
  private readonly messaging: Messaging
  private readonly logger: Pino.Logger
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration,
    @inject('Messaging') messaging: Messaging,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.exchange = exchange
    this.interval = new Interval(
      this.readNextDirectory,
      secondsToMiliseconds(configuration.readNextDirectoryIntervalInSeconds)
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

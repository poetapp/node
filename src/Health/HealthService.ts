import { Interval } from '@po.et/poet-js'
import { injectable, inject } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface HealthServiceConfiguration {
  readonly healthIntervalInSeconds: number
}

@injectable()
export class HealthService {
  private readonly logger: Pino.Logger
  private readonly configuration: HealthServiceConfiguration
  private readonly interval: Interval
  private readonly messaging: Messaging
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('HealthServiceConfiguration') configuration: HealthServiceConfiguration,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.configuration = configuration
    this.messaging = messaging
    this.interval = new Interval(this.getHealth, this.configuration.healthIntervalInSeconds * 1000)
    this.exchange = exchange
  }

  async start() {
    this.logger.info('Health Cron Starting...')
    this.interval.start()
  }

  async stop() {
    this.logger.info('Health Cron Stopping...')
    this.interval.stop()
  }

  private getHealth = async (): Promise<void> => {
    await this.messaging.publish(this.exchange.getHealth, '')
  }
}

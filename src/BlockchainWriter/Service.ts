import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface ServiceConfiguration {
  readonly anchorIntervalInSeconds: number
}

@injectable()
export class Service {
  private readonly interval: Interval
  private readonly exchange: ExchangeConfiguration
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging

  constructor(
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration,
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration,
  ) {
    this.exchange = exchange
    this.messaging = messaging
    this.logger = childWithFileName(logger, __filename)
    this.interval = new Interval(this.anchorNextHash, 1000 * configuration.anchorIntervalInSeconds)
  }

  async start() {
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private anchorNextHash = async () => {
    const logger = this.logger.child({ method: 'anchorNextHash' })

    logger.trace('Requesting anchoring of next hash')

    try {
      await this.messaging.publish(this.exchange.anchorNextHashRequest, '')
    } catch (error) {
      logger.error(
        {
          error,
        },
        'Uncaught exception while anchoring next hash',
      )
    }
  }
}

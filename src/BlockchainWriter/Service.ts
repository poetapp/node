import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface ServiceConfiguration {
  readonly anchorIntervalInSeconds: number
  readonly purgeStaleTransactionsInSeconds: number
  readonly maximumTransactionAgeInBlocks: number
}

@injectable()
export class Service {
  private readonly anchorNextHashInterval: Interval
  private readonly purgeStaleTransactionInterval: Interval
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
    this.anchorNextHashInterval = new Interval(this.anchorNextHash, 1000 * configuration.anchorIntervalInSeconds)
    this.purgeStaleTransactionInterval = new Interval(
      this.purgeStaleTransactions,
      1000 * configuration.purgeStaleTransactionsInSeconds,
    )
  }

  async start() {
    this.anchorNextHashInterval.start()
    this.purgeStaleTransactionInterval.start()
  }

  stop() {
    this.anchorNextHashInterval.stop()
    this.purgeStaleTransactionInterval.stop()
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

  private purgeStaleTransactions = async () => {
    const logger = this.logger.child({ method: 'purgeStaleTransactions' })

    logger.trace('Requesting a purge of stale transactions')

    try {
      await this.messaging.publish(this.exchange.purgeStaleTransactions, '')
    } catch (error) {
      logger.error(
        { error,
        },
        'Uncaught exception while purging stale transactions',
      )
    }
  }
}

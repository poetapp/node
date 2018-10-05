import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface ServiceConfiguration {
  readonly uploadClaimIntervalInSeconds: number
}

@injectable()
export class Service {
  private readonly messaging: Messaging
  private readonly logger: Pino.Logger
  private readonly uploadNextClaimInterval: Interval
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration
  ) {
    this.messaging = messaging
    this.logger = childWithFileName(logger, __filename)
    this.uploadNextClaimInterval = new Interval(
      this.uploadNextClaim,
      secondsToMiliseconds(configuration.uploadClaimIntervalInSeconds)
    )
    this.exchange = exchange
  }

  async start() {
    this.uploadNextClaimInterval.start()
  }

  stop() {
    this.uploadNextClaimInterval.stop()
  }

  private uploadNextClaim = async () => {
    const logger = this.logger.child({ method: 'uploadNextClaim' })
    try {
      await this.messaging.publish(this.exchange.storageWriterStoreNextClaim, '')
    } catch (error) {
      logger.error({ error }, 'Uncaught exception in StorageWriter Service')
    }
  }
}

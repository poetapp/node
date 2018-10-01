import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

export interface ServiceConfiguration {
  readonly uploadClaimIntervalInSeconds: number
}

@injectable()
export class Service {
  private readonly messaging: Messaging
  private readonly logger: Pino.Logger
  private readonly uploadNextClaimInterval: Interval

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration
  ) {
    this.messaging = messaging
    this.logger = childWithFileName(logger, __filename)
    this.uploadNextClaimInterval = new Interval(
      this.uploadNextClaim,
      secondsToMiliseconds(configuration.uploadClaimIntervalInSeconds)
    )
  }

  async start() {
    this.uploadNextClaimInterval.start()
  }

  stop() {
    this.uploadNextClaimInterval.stop()
  }

  private uploadNextClaim = async () => {
    const logger = this.logger.child({ method: 'readNextDirectory' })
    try {
      await this.messaging.publish(Exchange.StorageWriterStoreNextClaim, '')
    } catch (error) {
      logger.error({ error }, 'Uncaught exception in StorageWriter Service')
    }
  }
}

import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { secondsToMiliseconds } from 'Helpers/Time'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class Service {
  private readonly interval: Interval
  private readonly messaging: Messaging
  private readonly logger: Pino.Logger

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration,
    @inject('Messaging') messaging: Messaging
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.interval = new Interval(
      this.createNextBatch,
      secondsToMiliseconds(configuration.batchCreationIntervalInSeconds)
    )
  }

  start() {
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private createNextBatch = async () => {
    const logger = this.logger.child({ method: 'readNextDirectory' })
    try {
      await this.messaging.publish(Exchange.BatchWriterCreateNextBatchRequest, '')
    } catch (error) {
      logger.error({ error }, 'Uncaught exception in BatchWriter Service')
    }
  }
}

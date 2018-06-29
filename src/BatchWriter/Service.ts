import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'

import { secondsToMiliseconds } from 'Helpers/Time'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class Service {
  private readonly interval: Interval
  private readonly messaging: Messaging

  constructor(
    @inject('ServiceConfiguration') configuration: ServiceConfiguration,
    @inject('Messaging') messaging: Messaging
  ) {
    this.messaging = messaging
    this.interval = new Interval(
      this.createNextBatch,
      secondsToMiliseconds(configuration.createNextBatchIntervalInSeconds)
    )
  }

  start() {
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private createNextBatch = async () => {
    this.messaging.publish(Exchange.BatchWriterCreateNextBatchRequest, '')
  }
}

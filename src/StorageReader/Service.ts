import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

import { ClaimController } from './ClaimController'

export interface ServiceConfiguration {
  readonly downloadIntervalInSeconds: number
}

@injectable()
export class Service {
  private readonly logger: Pino.Logger
  private readonly claimController: ClaimController
  private readonly interval: Interval

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('ClaimController') claimController: ClaimController,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.claimController = claimController
    this.interval = new Interval(this.downloadNextHash, 1000 * configuration.downloadIntervalInSeconds)
  }

  async start() {
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private downloadNextHash = async () => {
    try {
      await this.claimController.downloadNextHash()
    } catch (error) {
      this.logger.error(
        {
          method: 'downloadNextHash',
          error,
        },
        'Uncaught Error Downloading Next Hash'
      )
    }
  }
}

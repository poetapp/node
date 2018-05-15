import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { Interval } from 'poet-js'

import { childWithFileName } from 'Helpers/Logging'

import { ClaimController } from './ClaimController'
import { ServiceConfiguration } from './ServiceConfiguration'

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
      this.logger.info('Downloading next entry')
      const result = await this.claimController.downloadNextHash()
      this.logger.info(result, 'Successfully downloaded entry')
    } catch (error) {
      this.logger.info(
        {
          method: 'downloadNextHash',
          error,
        },
        error.message
      )
    }
  }
}

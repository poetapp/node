import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

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
    this.interval = new Interval(this.timestampNextHash, 1000 * configuration.timestampIntervalInSeconds)
  }

  async start() {
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private timestampNextHash = async () => {
    const logger = this.logger.child({ method: 'timestampNextHash' })

    logger.trace('Requestion Timestamping of Next Hash')

    try {
      await this.claimController.timestampNextHash()
    } catch (error) {
      logger.error(
        {
          error,
        },
        'Uncaught exception while timestamping next hash'
      )
    }
  }
}

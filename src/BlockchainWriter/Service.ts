import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

import { Controller } from './Controller'

export interface ServiceConfiguration {
  readonly anchorIntervalInSeconds: number
}

@injectable()
export class Service {
  private readonly logger: Pino.Logger
  private readonly claimController: Controller
  private readonly interval: Interval

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Controller') claimController: Controller,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.claimController = claimController
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
      await this.claimController.anchorNextIPFSDirectoryHash()
    } catch (error) {
      logger.error(
        {
          error,
        },
        'Uncaught exception while anchoring next hash'
      )
    }
  }
}

import { Interval } from '@po.et/poet-js'
import { injectable, inject } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

import { HealthController } from './HealthController'
import { HealthServiceConfiguration } from './HealthServiceConfiguration'

@injectable()
export class HealthService {
  private readonly logger: Pino.Logger
  private readonly controller: HealthController
  private readonly configuration: HealthServiceConfiguration
  private readonly interval: Interval

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('HealthController') controller: HealthController,
    @inject('HealthServiceConfiguration') configuration: HealthServiceConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.controller = controller
    this.configuration = configuration
    this.interval = new Interval(this.getHealth, this.configuration.healthIntervalInSeconds * 1000)
  }

  async start() {
    this.logger.info('Health Cron Starting...')
    this.interval.start()
  }

  async stop() {
    this.logger.info('Health Cron Stopping...')
    this.interval.stop()
  }

  private getHealth = async (): Promise<any> => {
    await this.controller.checkIpfsConnection()
    await this.controller.getBlockchainInfo()
    await this.controller.getWalletInfo()
    await this.controller.getNetworkInfo()
  }
}

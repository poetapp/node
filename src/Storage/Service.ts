import { inject, injectable } from 'inversify'
import { Interval } from 'poet-js'

import { ClaimController } from './ClaimController'
import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class Service {
  private readonly claimController: ClaimController
  private readonly interval: Interval
  private readonly configuration: ServiceConfiguration

  constructor(
    @inject('ClaimController') claimController: ClaimController,
    @inject('ServiceConfiguration') configuration: ServiceConfiguration,
  ) {
    this.claimController = claimController
    this.configuration = configuration
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
      console.log(JSON.stringify({
        severity: 'error',
        module: 'Storage',
        file: 'Service',
        method: 'downloadNextHash',
        error,
      }, null, 2))
    }
  }

}

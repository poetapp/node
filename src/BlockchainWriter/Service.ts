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
    this.interval = new Interval(this.timestampNextHash, 1000 * configuration.timestampIntervalInSeconds)
  }

  async start() {
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private timestampNextHash = async () => {
    console.log(JSON.stringify({
      severity: 'debug',
      module: 'BlockchainWriter',
      file: 'Service',
      method: 'timestampNextHash',
    }, null, 2))

    try {
      await this.claimController.timestampNextHash()
    } catch (error) {
      console.log(JSON.stringify({
        severity: 'error',
        module: 'BlockchainWriter',
        file: 'Service',
        method: 'timestampNextHash',
        error,
      }, null, 2))
    }
  }

}

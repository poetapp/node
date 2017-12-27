import { inject, injectable } from 'inversify'

import { Interval } from 'Helpers/Interval'

import { ClaimController } from './ClaimController'

@injectable()
export class Service {
  private readonly claimController: ClaimController
  private readonly interval: Interval

  constructor(
    @inject('ClaimController') claimController: ClaimController,
  ) {
    this.claimController = claimController
    this.interval = new Interval(this.timestampNextHash, 1 * 3000)
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

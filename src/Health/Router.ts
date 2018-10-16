import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { IPFSHashFailure } from 'Interfaces'
import { Messaging } from 'Messaging/Messaging'

import { HealthController } from './HealthController'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly controller: HealthController

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('HealthController') controller: HealthController
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.controller = controller
  }

  async start() {
    await this.messaging.consumeClaimsNotDownloaded(this.onClaimsNotDownloaded)
  }

  async stop() {
    this.logger.info('Stopping Health Messaging...')
    await this.messaging.stop()
  }

  onClaimsNotDownloaded = async (ipfsHashFailures: ReadonlyArray<IPFSHashFailure>) => {
    const logger = this.logger.child({ method: 'onClaimsNotDownloaded' })

    logger.trace({ ipfsHashFailures }, 'IPFS Download Failure')
    try {
      await this.controller.upsertIPFSFailures(ipfsHashFailures)
    } catch (error) {
      logger.error({ error }, 'Failed to upsert ipfsHashFailures on health')
    }
  }
}

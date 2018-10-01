import { isClaim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: ClaimController
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') claimController: ClaimController,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
    this.exchange = exchange
  }

  async start() {
    await this.messaging.consume(this.exchange.newClaim, this.onNewClaim)
  }

  async stop() {
    this.logger.info('Stopping StorageWriter Router...')
    await this.messaging.stop()
  }

  onNewClaim = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onNewClaim' })

    const messageContent = message.content.toString()

    const claim = JSON.parse(messageContent)

    if (!isClaim(claim)) logger.error(`Received a ${this.exchange.newClaim} message, but the content isn't a claim.`)

    try {
      await this.claimController.create(claim)
    } catch (error) {
      logger.error(
        {
          error,
        },
        'Uncaught Exception while Storing Claim'
      )
    }
  }
}

import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { claimFromJSON } from 'Helpers/Claim'
import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: ClaimController

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') claimController: ClaimController
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
  }

  async start() {
    await this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
  }

  onNewClaim = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onNewClaim' })

    const messageContent = message.content.toString()

    const claim = claimFromJSON(JSON.parse(messageContent))

    if (claim === null) logger.error(`Received a ${Exchange.NewClaim} message, but the content isn't a claim.`)

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

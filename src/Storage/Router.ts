import { inject, injectable } from 'inversify'

import { isClaim } from 'Helpers/Claim'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'

@injectable()
export class Router {
  private readonly messaging: Messaging
  private readonly claimController: ClaimController

  constructor(
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') workController: ClaimController
  ) {
    this.messaging = messaging
    this.claimController = workController
  }

  start() {
    this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
  }

  onNewClaim = async (message: any): Promise<void> => {
    const messageContent = message.content.toString()

    const claim = JSON.parse(messageContent)

    if (!isClaim(claim))
      throw new Error(`Received a ${Exchange.NewClaim} message, but the content isn't a claim.`)

    await this.claimController.create(claim)
  }
}

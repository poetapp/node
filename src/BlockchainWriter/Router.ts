import { inject, injectable } from 'inversify'

import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'

@injectable()
export class Router {
  private readonly messaging: Messaging
  private readonly claimController: ClaimController

  constructor(
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') claimController: ClaimController
  ) {
    this.messaging = messaging
    this.claimController = claimController
  }

  async start() {
    await this.messaging.consume(Exchange.ClaimIPFSHash, this.onClaimIPFSHash)
  }

  onClaimIPFSHash = async (message: any): Promise<void> => {
    const messageContent = message.content.toString()
    console.log('onClaimIPFSHash', messageContent)

    const { claimId, ipfsHash } = JSON.parse(messageContent)

    try {
      await this.claimController.timestamp(ipfsHash)
    } catch (exception) {
      console.error(exception.message)
    }
  }
}

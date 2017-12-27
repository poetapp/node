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
    const { claimId, ipfsHash } = JSON.parse(messageContent)

    console.log(JSON.stringify({
      severity: 'debug',
      module: 'BlockchainWriter',
      file: 'Router',
      method: 'onClaimIPFSHash',
      message: 'Timestamping requested',
      claimId,
      ipfsHash,
    }, null, 2))

    try {
      await this.claimController.requestTimestamp(ipfsHash)
    } catch (exception) {
      console.log(JSON.stringify({
        severity: 'error',
        module: 'BlockchainWriter',
        file: 'Router',
        method: 'onClaimIPFSHash',
        message: 'Uncaught exception',
        exception,
        claimId,
        ipfsHash,
      }, null, 2))
    }
  }
}

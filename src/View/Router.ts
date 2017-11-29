import { inject, injectable } from 'inversify'

import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { WorkController } from './WorkController'

@injectable()
export class Router {
  private readonly messaging: Messaging
  private readonly workController: WorkController

  constructor(
    @inject('Messaging') messaging: Messaging,
    @inject('WorkController') workController: WorkController
  ) {
    this.messaging = messaging
    this.workController = workController
  }

  start() {
    this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
    this.messaging.consume(Exchange.ClaimIPFSHash, this.onClaimIPFSHash)
    this.messaging.consume(Exchange.IPFSHashTxId, this.onIPFSHashTxId)
  }

  onNewClaim = (message: any) => {
    const messageContent = message.content.toString()

    this.workController.createWork(JSON.parse(messageContent))
  }

  onClaimIPFSHash = (message: any) => {
    const messageContent = message.content.toString()
    const { claimId, ipfsHash } = JSON.parse(messageContent)

    this.workController.setIPFSHash(claimId, ipfsHash)
  }

  onIPFSHashTxId = (message: any) => {
    const messageContent = message.content.toString()
    const { ipfsHash, txId } = JSON.parse(messageContent)

    this.workController.setTxId(ipfsHash, txId)
  }
}

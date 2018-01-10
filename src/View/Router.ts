import { inject, injectable } from 'inversify'
import { ClaimIPFSHashPair, PoetTimestamp } from 'poet-js'

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

  async start() {
    await this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
    await this.messaging.consume(Exchange.ClaimIPFSHash, this.onClaimIPFSHash)
    await this.messaging.consume(Exchange.IPFSHashTxId, this.onIPFSHashTxId)
    await this.messaging.consumePoetTimestampsDownloaded(this.onPoetTimestampsDownloaded)
    await this.messaging.consumeClaimsDownloaded(this.onClaimsDownloaded)
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

  onPoetTimestampsDownloaded = async (poetTimestamps: ReadonlyArray<PoetTimestamp>) => {
    console.log(JSON.stringify({
      module: 'View',
      action: 'onPoetTimestampsDownloaded',
      poetTimestamps,
    }, null, 2))

    await this.workController.upsertTimestamps(poetTimestamps)
  }

  onClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    console.log(JSON.stringify({
      module: 'View',
      action: 'onClaimsDownloaded',
      claimIPFSHashPairs,
    }, null, 2))

    await this.workController.upsertClaimIPFSHashPair(claimIPFSHashPairs)
  }
}

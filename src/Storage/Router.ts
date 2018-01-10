import { inject, injectable } from 'inversify'
import { isClaim, PoetTimestamp } from 'poet-js'

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
    await this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
    await this.messaging.consumePoetTimestampsDownloaded(this.onPoetTimestampsDownloaded)
  }

  onNewClaim = async (message: any): Promise<void> => {
    const messageContent = message.content.toString()

    const claim = JSON.parse(messageContent)

    if (!isClaim(claim))
      throw new Error(`Received a ${Exchange.NewClaim} message, but the content isn't a claim.`)

    try {
      await this.claimController.create(claim)
    } catch (error) {
      console.log(JSON.stringify({
        severity: 'error',
        module: 'Storage',
        file: 'Router',
        method: 'onNewClaim',
        error,
      }, null, 2))
    }
  }

  onPoetTimestampsDownloaded = async (poetTimestamps: ReadonlyArray<PoetTimestamp>): Promise<void> => {
    console.log(JSON.stringify({
      action: 'onPoetTimestampsDownloaded',
      poetTimestamps
    }, null, 2))

    await this.claimController.download(poetTimestamps.map(_ => _.ipfsHash))
  }
}

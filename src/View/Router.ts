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
  }

  onNewClaim = (message: any) => {
    const messageContent = message.content.toString()

    this.workController.createWork(JSON.parse(messageContent))
  }
}

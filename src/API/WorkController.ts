import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { Work } from 'poet-js'

import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

@injectable()
export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging
  ) {
    this.logger = logger
    this.db = db
    this.collection = this.db.collection('works')
    this.messaging = messaging
  }

  async getById(id: string): Promise<any> {
    this.logger.trace({ id }, 'WorkController.getById')
    return this.collection.findOne({ id }, { fields: { _id: false } } )
  }

  async getByPublicKey(publicKey: string): Promise<any> {
    this.logger.trace({ publicKey }, 'WorkController.getByPublicKey')
    return this.collection.find({ publicKey }, { fields: { _id: false } } ).toArray()
  }

  async create(work: Work): Promise<void> {
    this.logger.trace({ work }, 'WorkController.create')
    // TODO: verify id, publicKey, signature and createdDate
    await this.messaging.publish(Exchange.NewClaim, work)
  }
}

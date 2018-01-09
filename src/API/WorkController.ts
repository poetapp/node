import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import { Work } from 'poet-js'

import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

@injectable()
export class WorkController {
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging

  constructor(
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging
  ) {
    this.db = db
    this.collection = this.db.collection('works')
    this.messaging = messaging
  }

  async getById(id: string): Promise<any> {
    console.log(`WorkController.getByid(${id})`)
    return this.collection.findOne({ id }, { fields: { _id: false } } )
  }

  async getByPublicKey(publicKey: string): Promise<any> {
    console.log(JSON.stringify({
      module: 'API',
      action: 'WorkController.getByPublicKey',
      publicKey,
    }, null, 2))
    return this.collection.find({ publicKey }, { fields: { _id: false } } ).toArray()
  }

  async create(work: Work): Promise<void> {
    console.log(`WorkController.create(${JSON.stringify(work)})`)
    // TODO: verify id, publicKey, signature and createdDate
    await this.messaging.publish(Exchange.NewClaim, work)
  }
}

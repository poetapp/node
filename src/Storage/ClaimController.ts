import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { Claim } from 'Interfaces'

import { IPFS } from './IPFS'

@injectable()
export class ClaimController {
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly ipfs: IPFS

  constructor(
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.db = db
    this.collection = this.db.collection('storage')
    this.messaging = messaging
    this.ipfs = ipfs
  }

  async create(claim: Claim): Promise<void> {
    console.log(`Storage.WorkController.create(${JSON.stringify(claim)})`)
    const ipfsHash = await this.ipfs.addText(JSON.stringify(claim))
    this.collection.insertOne({
      claimId: claim.id,
      ipfsHash
    })
    await this.messaging.publish(Exchange.ClaimIPFSHash, {
      claimId: claim.id,
      ipfsHash
    })
    console.log(`Storage.WorkController.create, created ${ipfsHash}`)
  }
}

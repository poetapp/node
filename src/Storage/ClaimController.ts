import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

import { isClaim } from 'Helpers/Claim'
import { Exchange, BlockchainPoetTimestampMessage } from 'Messaging/Messages'
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
    await this.collection.insertOne({
      claimId: claim.id,
      ipfsHash
    })
    await this.messaging.publish(Exchange.ClaimIPFSHash, {
      claimId: claim.id,
      ipfsHash
    })
    console.log(`Storage.WorkController.create, created ${ipfsHash}`)
  }

  async download(poetBlockchainMessage: BlockchainPoetTimestampMessage) {
    console.log(JSON.stringify({
      action: 'Download',
      message: 'Downloading ipfsHashes from BlockchainPoetTimestampMessage',
      poetBlockchainMessage
    }, null, 2))

    const ipfsHashes = poetBlockchainMessage.poetMessages.map(_ => _.ipfsHash)

    const claims = await Promise.all(ipfsHashes.map(this.downloadClaim))

    // TODO: store in Storage's DB
    // TODO: send claims to RMQ
    // TODO: structure claims + ipfsHashes so they can be linked

    console.log(JSON.stringify({
      action: 'Download',
      message: 'Downloaded claims from IPFS',
      ipfsHashes,
      claims
    }, null, 2))

  }

  private downloadClaim = async (ipfsHash: string): Promise<Claim> => {
    const text = await this.ipfs.cat(ipfsHash)
    const claim = JSON.parse(text)

    if (!isClaim(claim))
      throw new Error('not claim') // TODO: type error

    return claim
  }

}

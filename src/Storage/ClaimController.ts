import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

import { BlockchainPoetTimestamp } from 'Helpers/Bitcoin'
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
    const extendedClaims: ReadonlyArray<Claim & BlockchainPoetTimestamp> = claims.map((claim, index) => ({
      ...claim,
      ...poetBlockchainMessage.poetMessages[index]
    }))

    console.log(JSON.stringify({
      action: 'Download',
      message: 'Downloaded claims from IPFS',
      extendedClaims
    }, null, 2))

    const claimidIPFSHashPairs = extendedClaims.map(extendedClaim => ({
      claimId: extendedClaim.id,
      ipfsHash: extendedClaim.ipfsHash
    }))

    const results = await Promise.all(claimidIPFSHashPairs.map(({claimId, ipfsHash}) =>
      this.collection.updateOne({ claimId }, { $set: { ipfsHash } }, { upsert: true })
    ))

    const databaseErrors = results.filter(_ => _.result.n !== 1)

    if (databaseErrors.length)
      console.error(JSON.stringify({
        action: 'Download',
        message: 'Error Storing { claimId, ipfsHash } pairs in the DB.',
        databaseErrors,
      }, null, 2))

    console.log(JSON.stringify({
      action: 'Download',
      message: 'Stored { claimId, ipfsHash } pairs in the DB successfully.',
    }, null, 2))

    // TODO: send extendedClaims to RMQ

  }

  private downloadClaim = async (ipfsHash: string): Promise<Claim> => {
    const text = await this.ipfs.cat(ipfsHash)
    const claim = JSON.parse(text)

    if (!isClaim(claim))
      throw new Error('Unrecognized claim')

    return claim
  }

}

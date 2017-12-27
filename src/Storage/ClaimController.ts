import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

import { Claim, isClaim, ClaimIdIPFSHashPair } from 'Interfaces'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

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
    console.log(`Storage.WorkController.create(${JSON.stringify(claim)}), ipfsHash = ${ipfsHash}`)
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

  async download(ipfsHashes: ReadonlyArray<string>) {
    console.log(JSON.stringify({
      action: 'Download',
      message: 'Downloading IPFS hashes',
      ipfsHashes,
    }, null, 2))

    const claims = await Promise.all(ipfsHashes.map(this.downloadClaim))

    console.log(JSON.stringify({
      action: 'Download',
      message: 'Downloaded claims from IPFS',
      claims,
    }, null, 2))

    await this.updateClaimIdIPFSHashPairs(ipfsHashes.map((ipfsHash, index) => ({
      claimId: claims[index].id,
      ipfsHash,
    })))

    await this.messaging.publishClaimsDownloaded(ipfsHashes.map((ipfsHash, index) => ({
      claim: claims[index],
      ipfsHash,
    })))
  }

  private downloadClaim = async (ipfsHash: string): Promise<Claim> => {
    const text = await this.ipfs.cat(ipfsHash)
    const claim = JSON.parse(text)

    if (!isClaim(claim))
      throw new Error('Unrecognized claim')

    return claim
  }

  private async updateClaimIdIPFSHashPairs(claimIdIPFSHashPairs: ReadonlyArray<ClaimIdIPFSHashPair>) {
    const results = await Promise.all(claimIdIPFSHashPairs.map(({claimId, ipfsHash}) =>
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
  }

}

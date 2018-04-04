import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import { Claim, isClaim, ClaimIdIPFSHashPair } from 'poet-js'

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
    console.log(JSON.stringify({
      severity: 'trace',
      module: 'Storage',
      file: 'ClaimController',
      method: 'create',
      claim,
    }, null, 2))

    const ipfsHash = await this.ipfs.addText(JSON.stringify(claim))

    console.log(JSON.stringify({
      severity: 'debug',
      module: 'Storage',
      file: 'ClaimController',
      method: 'create',
      claim,
      ipfsHash,
    }, null, 2))

    await this.collection.insertOne({
      claimId: claim.id,
      ipfsHash,
    })
    await this.messaging.publish(Exchange.ClaimIPFSHash, {
      claimId: claim.id,
      ipfsHash,
    })
  }

  async download(ipfsHashes: ReadonlyArray<string>) {
    console.log(JSON.stringify({
      severity: 'trace',
      module: 'Storage',
      file: 'ClaimController',
      method: 'download',
      ipfsHashes,
    }, null, 2))

    await this.collection.insertMany(ipfsHashes.map(ipfsHash => ({ ipfsHash, claimId: null })), { ordered: false })
  }

  async downloadNextHash() {
    console.log(JSON.stringify({
      severity: 'trace',
      module: 'Storage',
      file: 'ClaimController',
      method: 'downloadNextHash',
    }, null, 2))

    const ipfsHashEntry = await this.collection.findOne({ claimId: null, $or: [ {attempts: { $lt: 5 }}, {attempts: { $exists: false }}] })
    const ipfsHash = ipfsHashEntry && ipfsHashEntry.ipfsHash

    console.log(JSON.stringify({
      severity: 'trace',
      module: 'Storage',
      file: 'ClaimController',
      method: 'downloadNextHash',
      ipfsHash,
    }, null, 2))

    if (!ipfsHash)
      return

    let claim
    try {
      claim = await this.downloadClaim(ipfsHash)
    } catch (exception) {
      await this.collection.updateOne({ ipfsHash }, { $inc: { attempts: 1 } })

      console.log(JSON.stringify({
        severity: 'debug',
        module: 'Storage',
        file: 'ClaimController',
        method: 'downloadNextHash',
        message: 'Exception caught calling downloadClaim',
        ipfsHash,
        exception,
      }, null, 2))

      return
    }

    console.log(JSON.stringify({
      severity: 'info',
      module: 'Storage',
      file: 'ClaimController',
      method: 'downloadNextHash',
      message: 'Successfully downloaded claim from IPFS',
      ipfsHash,
      claim,
    }, null, 2))

    await this.updateClaimIdIPFSHashPairs([{
      claimId: claim.id,
      ipfsHash,
    }])

    await this.messaging.publishClaimsDownloaded([{
      claim,
      ipfsHash,
    }])

  }

  private downloadClaim = async (ipfsHash: string): Promise<Claim> => {
    const text = await this.ipfs.cat(ipfsHash)
    const claim = JSON.parse(text)

    if (!isClaim(claim))
      throw new Error('Unrecognized claim')

    return claim
  }

  private async updateClaimIdIPFSHashPairs(claimIdIPFSHashPairs: ReadonlyArray<ClaimIdIPFSHashPair>) {
    console.log(JSON.stringify({
      severity: 'trace',
      module: 'Storage',
      file: 'ClaimController',
      method: 'updateClaimIdIPFSHashPairs',
      message: 'Storeding { claimId, ipfsHash } pairs in the DB.',
      claimIdIPFSHashPairs,
    }, null, 2))

    const results = await Promise.all(claimIdIPFSHashPairs.map(({claimId, ipfsHash}) =>
      this.collection.updateOne({ ipfsHash }, { $set: { claimId } }, { upsert: true })
    ))

    const databaseErrors = results.filter(_ => _.result.n !== 1)

    if (databaseErrors.length)
      console.error(JSON.stringify({
        action: 'Download',
        message: 'Error Storing { claimId, ipfsHash } pairs in the DB.',
        databaseErrors,
      }, null, 2))

    console.log(JSON.stringify({
      severity: 'trace',
      module: 'Storage',
      file: 'ClaimController',
      method: 'updateClaimIdIPFSHashPairs',
      message: 'Stored { claimId, ipfsHash } pairs in the DB successfully.',
      claimIdIPFSHashPairs,
    }, null, 2))

  }

}

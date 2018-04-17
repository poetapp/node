import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { Claim, isClaim, ClaimIdIPFSHashPair } from 'poet-js'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { IPFS } from './IPFS'

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('storage')
    this.messaging = messaging
    this.ipfs = ipfs
  }

  async create(claim: Claim): Promise<void> {
    const logger = this.logger.child({ method: 'create' })

    logger.trace({ claim }, 'Storing Claim')

    const ipfsHash = await this.ipfs.addText(JSON.stringify(claim))

    logger.info({ claim, ipfsHash }, 'Claim Stored')

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
    const logger = this.logger.child({ method: 'download' })

    logger.trace({ ipfsHashes }, 'Downloading Claims')

    await this.collection.insertMany(ipfsHashes.map(ipfsHash => ({ ipfsHash, claimId: null })), { ordered: false })
  }

  async downloadNextHash() {
    const logger = this.logger.child({ method: 'downloadNextHash' })

    logger.trace('Downloading Next Hash')

    const ipfsHashEntry = await this.collection.findOne({ claimId: null, $or: [ {attempts: { $lt: 5 }}, {attempts: { $exists: false }}] })
    const ipfsHash = ipfsHashEntry && ipfsHashEntry.ipfsHash

    logger.trace({ ipfsHash }, 'Downloading Next Hash')

    if (!ipfsHash)
      return

    let claim
    try {
      claim = await this.downloadClaim(ipfsHash)
    } catch (exception) {
      await this.collection.updateOne({ ipfsHash }, { $inc: { attempts: 1 } })

      logger.debug({ ipfsHash, exception }, 'Failed to Download Claim')

      return
    }

    logger.info({ ipfsHash, claim }, 'Successfully downloaded claim from IPFS')

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
    const logger = this.logger.child({ method: 'updateClaimIdIPFSHashPairs' })

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsHash } pairs in the DB.')

    const results = await Promise.all(claimIdIPFSHashPairs.map(({claimId, ipfsHash}) =>
      this.collection.updateOne({ ipfsHash }, { $set: { claimId } }, { upsert: true })
    ))

    const databaseErrors = results.filter(_ => _.result.n !== 1)

    if (databaseErrors.length)
      logger.error({ databaseErrors }, 'Error storing { claimId, ipfsHash } pairs in the DB.')

    logger.trace({ claimIdIPFSHashPairs }, 'Storing { claimId, ipfsHash } pairs in the DB successfully.')
  }

}

import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { ClaimIPFSHashPair, PoetTimestamp, Work } from 'poet-js'

import { childWithFileName } from 'Helpers/Logging'

@injectable()
export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection

  constructor(@inject('Logger') logger: Pino.Logger, @inject('DB') db: Db) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('works')
  }

  createWork = async (work: Work): Promise<void> => {
    this.logger.trace({ work }, 'Creating Work')

    const existing = await this.collection.findOne({ id: work.id })

    if (existing) return

    this.collection.insertOne(work)
  }

  setIPFSHash = (workId: string, ipfsHash: string): void => {
    this.logger.trace({ workId, ipfsHash }, 'Setting the IPFS Hash for a Work')
    this.collection.updateOne(
      { id: workId },
      { $set: { 'timestamp.ipfsHash': ipfsHash } }
    )
  }

  setTxId = (ipfsHash: string, transactionId: string): void => {
    this.logger.trace(
      { ipfsHash, transactionId },
      'Setting the Transaction ID for a IPFS Hash'
    )
    this.collection.updateMany(
      { 'timestamp.ipfsHash': ipfsHash },
      { $set: { 'timestamp.transactionId': transactionId } }
    )
  }

  async upsertTimestamps(poetTimestamps: ReadonlyArray<PoetTimestamp>) {
    this.logger.trace({ poetTimestamps }, 'Upserting Po.et Timestamps')
    await Promise.all(
      poetTimestamps.map(timestamp =>
        this.collection.updateOne(
          { 'timestamp.ipfsHash': timestamp.ipfsHash },
          { $set: { timestamp } },
          { upsert: true }
        )
      )
    )
  }

  async upsertClaimIPFSHashPair(
    claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>
  ) {
    this.logger.trace({ claimIPFSHashPairs }, 'Upserting Claims by IPFS Hash')
    await Promise.all(
      claimIPFSHashPairs.map(({ claim, ipfsHash }) =>
        this.collection.updateOne(
          { 'timestamp.ipfsHash': ipfsHash },
          { $set: claim },
          { upsert: true }
        )
      )
    )
  }
}

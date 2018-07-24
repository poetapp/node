import { Work, PoetTimestamp } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'

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

    await this.collection.insertOne(work)
  }

  setIPFSHash = async (workId: string, ipfsHash: string): Promise<void> => {
    this.logger.trace({ workId, ipfsHash }, 'Setting the IPFS Hash for a Work')
    await this.collection.updateOne({ id: workId }, { $set: { 'timestamp.ipfsHash': ipfsHash } })
  }

  setTxId = async (ipfsHash: string, transactionId: string): Promise<void> => {
    this.logger.trace({ ipfsHash, transactionId }, 'Setting the Transaction ID for a IPFS Hash')
    await this.collection.updateMany(
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

  async upsertClaimIPFSHashPair(claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) {
    this.logger.trace({ claimIPFSHashPairs }, 'Upserting Claims by IPFS Hash')
    await Promise.all(
      claimIPFSHashPairs.map(({ claim, ipfsHash }) =>
        this.collection.updateOne({ 'timestamp.ipfsHash': ipfsHash }, { $set: claim }, { upsert: true })
      )
    )
  }
}

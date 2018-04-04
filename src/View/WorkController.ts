import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import { ClaimIPFSHashPair, PoetTimestamp, Work } from 'poet-js'

@injectable()
export class WorkController {
  private readonly db: Db
  private readonly collection: Collection

  constructor(
    @inject('DB') db: Db
  ) {
    this.db = db
    this.collection = this.db.collection('works')
  }

  createWork = async (work: Work): Promise<void> => {
    console.log('Creating Work', work)

    const existing = await this.collection.findOne({ id: work.id })

    if (existing)
      return

    const result = this.collection.insertOne(work)
  }

  setIPFSHash = (workId: string, ipfsHash: string): void => {
    console.log('setIPFSHash', workId, ipfsHash)
    const result = this.collection.updateOne({ id: workId }, { $set: { 'timestamp.ipfsHash': ipfsHash } })
  }

  setTxId = (ipfsHash: string, transactionId: string): void => {
    console.log('setTxId', ipfsHash, transactionId)
    const result = this.collection.updateMany({ 'timestamp.ipfsHash': ipfsHash }, { $set: { 'timestamp.transactionId': transactionId } })
  }

  async upsertTimestamps(poetTimestamps: ReadonlyArray<PoetTimestamp>) {
    await Promise.all(poetTimestamps.map(timestamp =>
      this.collection.updateOne({ 'timestamp.ipfsHash': timestamp.ipfsHash}, { $set: { timestamp } }, { upsert: true })
    ))
  }

  async upsertClaimIPFSHashPair(claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) {
    await Promise.all(claimIPFSHashPairs.map(({ claim, ipfsHash }) =>
      this.collection.updateOne({ 'timestamp.ipfsHash': ipfsHash }, { $set: claim }, { upsert: true })
    ))
  }
}

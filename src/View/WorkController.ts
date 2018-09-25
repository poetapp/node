import { Work, PoetBlockAnchor } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'

@injectable()
export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly timestampCollection: Collection
  private readonly workCollection: Collection

  constructor(@inject('Logger') logger: Pino.Logger, @inject('DB') db: Db) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.timestampCollection = this.db.collection('timestamps')
    this.workCollection = this.db.collection('works')
  }

  createWork = async (work: Work): Promise<void> => {
    this.logger.trace({ work }, 'Creating Work')

    const existing = await this.workCollection.findOne({ id: work.id })

    if (existing) return

    await this.workCollection.insertOne(work)
  }

  setIPFSHash = async (workId: string, ipfsFileHash: string): Promise<void> => {
    this.logger.trace({ workId, ipfsFileHash }, 'Setting the IPFS Hash for a Work')
    await this.workCollection.updateOne({ id: workId }, { $set: { 'timestamp.ipfsFileHash': ipfsFileHash } })
  }

  setDirectoryHashOnEntries = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string
  }) => {
    const logger = this.logger.child({ method: 'setDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')
    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        this.workCollection.updateOne(
          { 'timestamp.ipfsFileHash': ipfsFileHash },
          { $set: { 'timestamp.ipfsDirectoryHash': ipfsDirectoryHash } },
          { upsert: true }
        )
      )
    )
  }

  setTxId = async (ipfsDirectoryHash: string, transactionId: string): Promise<void> => {
    this.logger.trace({ ipfsDirectoryHash, transactionId }, 'Setting the Transaction ID for a IPFS Hash')
    await this.workCollection.updateMany(
      { 'timestamp.ipfsDirectoryHash': ipfsDirectoryHash },
      { $set: { 'timestamp.transactionId': transactionId } }
    )
  }

  async upsertAnchors(poetTimestamps: ReadonlyArray<PoetBlockAnchor>) {
    this.logger.trace({ poetTimestamps }, 'Upserting Po.et Anchors')

    await Promise.all(
      poetTimestamps.map(timestamp =>
        this.timestampCollection.updateOne(
          { ipfsDirectoryHash: timestamp.ipfsDirectoryHash },
          { $set: timestamp },
          { upsert: true }
        )
      )
    )
  }

  setFileHashesForDirectoryHash = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string
  }) => {
    const logger = this.logger.child({ method: 'setFileHashesForDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')
    const timestamp = await this.timestampCollection.findOne({ ipfsDirectoryHash }, { projection: { _id: 0 } })
    logger.debug({ ipfsFileHashes, ipfsDirectoryHash, timestamp }, 'setting directory hash on work entries')

    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        this.workCollection.updateOne(
          { 'timestamp.ipfsFileHash': ipfsFileHash },
          { $set: { timestamp: { ...timestamp, ipfsFileHash } } },
          { upsert: true }
        )
      )
    )
  }

  async upsertClaimIPFSHashPair(claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) {
    this.logger.debug({ claimIPFSHashPairs }, 'Upserting Claims by IPFS Hash')
    await Promise.all(
      claimIPFSHashPairs.map(({ claim, ipfsFileHash }) =>
        this.workCollection.updateOne({ 'timestamp.ipfsFileHash': ipfsFileHash }, { $set: claim }, { upsert: true })
      )
    )
  }
}

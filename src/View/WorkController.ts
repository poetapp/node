import { Work, PoetBlockAnchor } from '@po.et/poet-js'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly anchorCollection: Collection
  private readonly workCollection: Collection

  constructor({
    dependencies: {
      logger,
      db,
    },
  }: Arguments) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.anchorCollection = this.db.collection('anchors')
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
    await this.workCollection.updateOne({ id: workId }, { $set: { 'anchor.ipfsFileHash': ipfsFileHash } })
  }

  setDirectoryHashOnEntries = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    const logger = this.logger.child({ method: 'setDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')
    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        this.workCollection.updateOne(
          { 'anchor.ipfsFileHash': ipfsFileHash },
          { $set: { 'anchor.ipfsDirectoryHash': ipfsDirectoryHash } },
          { upsert: true },
        ),
      ),
    )
  }

  setTxId = async (ipfsDirectoryHash: string, transactionId: string): Promise<void> => {
    this.logger.trace({ ipfsDirectoryHash, transactionId }, 'Setting the Transaction ID for a IPFS Hash')
    await this.workCollection.updateMany(
      { 'anchor.ipfsDirectoryHash': ipfsDirectoryHash },
      { $set: { 'anchor.transactionId': transactionId } },
    )
  }

  async upsertAnchors(poetAnchors: ReadonlyArray<PoetBlockAnchor>) {
    this.logger.trace({ poetAnchors }, 'Upserting Po.et Anchors')

    await Promise.all(
      poetAnchors.map(anchor =>
        this.anchorCollection.updateOne(
          { ipfsDirectoryHash: anchor.ipfsDirectoryHash },
          { $set: anchor },
          { upsert: true },
        ),
      ),
    )
  }

  setFileHashesForDirectoryHash = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    const logger = this.logger.child({ method: 'setFileHashesForDirectoryHash' })
    logger.trace({ ipfsFileHashes, ipfsDirectoryHash }, 'setting directory hash on work entries')
    const anchor = await this.anchorCollection.findOne({ ipfsDirectoryHash }, { projection: { _id: 0 } })
    logger.debug({ ipfsFileHashes, ipfsDirectoryHash, anchor }, 'setting directory hash on work entries')

    await Promise.all(
      ipfsFileHashes.map(ipfsFileHash =>
        this.workCollection.updateOne(
          { 'anchor.ipfsFileHash': ipfsFileHash },
          { $set: { anchor: { ...anchor, ipfsFileHash } } },
          { upsert: true },
        ),
      ),
    )
  }

  async upsertClaimIPFSHashPair(claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) {
    this.logger.debug({ claimIPFSHashPairs }, 'Upserting Claims by IPFS Hash')
    await Promise.all(
      claimIPFSHashPairs.map(({ claim, ipfsFileHash }) =>
        this.workCollection.updateOne({ 'anchor.ipfsFileHash': ipfsFileHash }, { $set: claim }, { upsert: true }),
      ),
    )
  }
}

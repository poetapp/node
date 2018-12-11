import { Collection } from 'mongodb'
import { isNil } from 'ramda'

import { IPFSHashTxId } from 'Messaging/Messages'

type updateAnchorAttemptsInfo = (x: IPFSHashTxId) => Promise<void>

export interface AnchorRetryDAOResult {
  readonly _id: number
  readonly count: number
}

export interface TransactionAnchorRetryEntry {
  readonly attempts: number
  readonly count: number
}

export type TransactionAnchorRetryInfo = ReadonlyArray<TransactionAnchorRetryEntry>
export type getTransactionAnchorRetryInfo = () => Promise<TransactionAnchorRetryInfo>
type deleteByTransactionIds = (transactionIds: ReadonlyArray<string>) => Promise<void>

export interface Dependencies {
  readonly ipfsDirectoryHashInfoCollection: Collection
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class IPFSDirectoryHashDAO {
  private readonly ipfsDirectoryHashInfoCollection: Collection

  constructor({
    dependencies: {
      ipfsDirectoryHashInfoCollection,
    },
  }: Arguments) {
    this.ipfsDirectoryHashInfoCollection = ipfsDirectoryHashInfoCollection
  }

  readonly start = async (): Promise<void> => {
    await this.ipfsDirectoryHashInfoCollection.createIndex({ ipofsDirectoryHash: 1 }, { unique: true })
    await this.ipfsDirectoryHashInfoCollection.createIndex({ txId: 1, attempts: 1 })
  }

  readonly updateAnchorAttemptsInfo: updateAnchorAttemptsInfo = async anchorAttemptInfo => {
    await this.ipfsDirectoryHashInfoCollection.updateOne(
      {
        ipfsDirectoryHash: anchorAttemptInfo.ipfsDirectoryHash,
        txId: { $ne: anchorAttemptInfo.txId },
      },
      {
        $set: { txId: anchorAttemptInfo.txId },
        $inc: { attempts: 1 },
      },
      { upsert: true },
    )
  }

  readonly deleteByTransactionIds: deleteByTransactionIds = async transactionIds => {
    await this.ipfsDirectoryHashInfoCollection.deleteMany(
      {
        txId: { $in: transactionIds },
      },
    )
  }

  readonly getTransactionAnchorRetryInfo: getTransactionAnchorRetryInfo = async () => {
    const cursorArray = await this.ipfsDirectoryHashInfoCollection.aggregate([
      { $match: { attempts: { $ne: 1 } } },
      { $group: { _id: '$attempts', count: { $sum: 1} } },
    ]).toArray()

    if (isNil(cursorArray)) return []

    return cursorArray.map(
      (item: AnchorRetryDAOResult) => (
        {
          attempts: item._id,
          count: item.count,
        }
      ),
    )
  }}

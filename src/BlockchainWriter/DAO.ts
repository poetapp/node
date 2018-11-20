import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface Entry {
  readonly ipfsDirectoryHash?: string
  readonly txId?: string,
  readonly transactionCreationDate?: Date
  readonly blockHeight?: number
  readonly blockHash?: string
  readonly creationBlockHeight?: number
}

@injectable()
export class DAO {
  private readonly blockchainWriterCollection: Collection

  constructor(@inject('BlockchainWriterCollection') blockchainWriterCollection: Collection) {
    this.blockchainWriterCollection = blockchainWriterCollection
  }

  readonly start = async () => {
    await this.blockchainWriterCollection.createIndex({ ipfsDirectoryHash: 1 }, { unique: true })
    await this.blockchainWriterCollection.createIndex({ txId: 1 })
  }

  readonly insertIpfsDirectoryHash = (ipfsDirectoryHash: string) =>
    this.blockchainWriterCollection.insertOne({
      ipfsDirectoryHash,
      txId: null,
      transactionCreationDate: null,
      blockHash: null,
      blockHeight: null,
    })

  readonly purgeStaleTransactions = (thresholdBlock: number) =>
    this.blockchainWriterCollection.updateMany(
      {
        txId: { $ne: null },
        blockHeight: null,
        creationBlockHeight: { $lt: thresholdBlock },
      },
      {
        $set: { txId: null },
      },
    )

  readonly findTransactionlessEntry = () => this.blockchainWriterCollection.findOne({ txId: null })

  readonly updateAllByTransactionId =  async (txIds: ReadonlyArray<string>, entry: Entry) => {
    await this.blockchainWriterCollection.updateMany(
      { txId: { $in: txIds } },
      { $set : entry },
    )
  }

  readonly updateByIPFSDirectoryHash = async ({ ipfsDirectoryHash, ...updates }: Entry) => {
    await this.blockchainWriterCollection.updateOne(
      { ipfsDirectoryHash },
      { $set : updates },
      { upsert: true },
    )
  }
}

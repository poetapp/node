import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

interface Entry {
  readonly ipfsDirectoryHash: string
  readonly txId?: string,
  readonly transactionCreationDate?: string
}

@injectable()
export class DAO {
  private readonly blockchainWriterCollection: Collection

  constructor(@inject('BlockchainWriterCollection') blockchainWriterCollection: Collection) {
    this.blockchainWriterCollection = blockchainWriterCollection
  }

  readonly start = async () => {
    await this.blockchainWriterCollection.createIndex({ ipfsDirectoryHash: 1 }, { unique: true })
  }

  readonly insertIpfsDirectoryHash = (ipfsDirectoryHash: string) =>
    this.blockchainWriterCollection.insertOne({
      ipfsDirectoryHash,
      txId: null,
    })

  readonly findTransactionlessEntry = () => this.blockchainWriterCollection.findOne({ txId: null })

  readonly findAndUpdateByIPFSDirectoryHash = ({ ipfsDirectoryHash, ...updates }: Entry) =>
    this.blockchainWriterCollection.updateOne(
      { ipfsDirectoryHash },
      { $set : updates },
      { upsert: true },
    )
}

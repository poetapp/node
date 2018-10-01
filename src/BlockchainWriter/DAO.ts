import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

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

  readonly setTransactionId = (ipfsDirectoryHash: string, txId: string) =>
    this.blockchainWriterCollection.updateOne({ ipfsDirectoryHash }, { $set: { txId } }, { upsert: true })
}

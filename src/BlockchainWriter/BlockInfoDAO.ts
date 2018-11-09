import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'
import { LightBlock } from 'Messaging/Messages'

@injectable()
export class BlockInfoDAO {
  private readonly blockchainInfo: Collection

  constructor(
    @inject('BlockchainInfoCollection') blockchainInfo: Collection
  ) {
    this.blockchainInfo = blockchainInfo
  }

  readonly start = async () => {
    await this.blockchainInfo.createIndex({ height: 1, hash: 1 }, { unique: true })
  }

  readonly insertBlockInfo = ({ height, hash }: LightBlock) =>
    this.blockchainInfo.insertOne({ height, hash })
}

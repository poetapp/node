import { LightBlock } from 'Messaging/Messages'
import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

@injectable()
export class BlockInfoDAO {
  private readonly blockchainInfo: Collection

  constructor(
    @inject('BlockchainInfoCollection') blockchainInfo: Collection,
  ) {
    this.blockchainInfo = blockchainInfo
  }

  readonly start = async () => {
    await this.blockchainInfo.createIndex({ height: 1, hash: 1 }, { unique: true })
  }

  readonly insertBlockInfo = (lightBlock: LightBlock) =>
    this.blockchainInfo.insertOne(lightBlock)

  readonly getHighestBlock = async (): Promise<LightBlock> => {
    const cursor = this.blockchainInfo.find().sort({height: -1}).limit(1)
    return cursor.next()
  }
}

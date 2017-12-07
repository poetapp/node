import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

import { BlockchainPoetTimestamp, getPoetData } from 'Helpers/Bitcoin'
import { InsightHelper } from 'Helpers/Insight'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

@injectable()
export class ClaimController {
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly insightHelper: InsightHelper
  private readonly configuration: ClaimControllerConfiguration

  constructor(
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('InsightHelper') insightHelper: InsightHelper,
    @inject('ClaimControllerConfiguration') configuration: ClaimControllerConfiguration,
  ) {
    this.db = db
    this.messaging = messaging
    this.insightHelper = insightHelper
    this.configuration = configuration
    this.collection = this.db.collection('blockchainReader')
  }

  async scanBlock(blockHeight: number): Promise<void> {
    console.log(JSON.stringify({
      action: 'Scanning Block',
      message: 'Retrieving Block Hash...',
      blockHeight
    }, null, 2))

    const blockHash = await this.insightHelper.getBlockHash(blockHeight)

    console.log(JSON.stringify({
      action: 'Scanning Block',
      message: 'Block Hash retrieved successfully. Retrieving Raw Block...',
      blockHeight,
      blockHash
    }, null, 2))

    const block = await this.insightHelper.getBlock(blockHash)
    const transactionIds = block.transactions.map(_ => _.id)
    const poetData: ReadonlyArray<BlockchainPoetTimestamp> = block.transactions.map(getPoetData).filter(_ => _)

    const matchingPoetData = poetData
      .filter(this.blockchainPoetMessageNetworkMatches)
      .filter(this.blockchainPoetMessageVersionMatches)

    const unmatchingPoetData = poetData
      .filter(_ => !matchingPoetData.includes(_))

    console.log(JSON.stringify({
      action: 'Scanning Block',
      message: 'Raw Block retrieved and scanned successfully.',
      blockHeight,
      blockHash,
      matchingPoetData,
      unmatchingPoetData
    }, null, 2))

    await this.collection.updateOne({ blockHeight }, {
        $set: { blockHash, transactionIds, poetData }
      }, { upsert: true})

    if (matchingPoetData.length)
      await this.messaging.publishPoetTimestamp({
        blockHeight,
        blockHash,
        poetMessages: matchingPoetData
      })

  }

  /**
   * @returns {Promise<number>} The highest block height from the database, or null if no block has been processed.
   */
  async findHighestBlockHeight(): Promise<number> {
    const queryResults = await this.collection.find({ }, { blockHeight: true, _id: 0 }).sort({blockHeight: -1}).limit(1).toArray()
    const highestBlockHeight = queryResults && !!queryResults.length && queryResults[0].blockHeight || null

    console.log(JSON.stringify({
      action: 'findHighestBlockHeight',
      highestBlockHeight
    }, null, 2))

    return highestBlockHeight
  }

  private blockchainPoetMessageNetworkMatches = (blockchainPoetMessage: BlockchainPoetTimestamp) => {
    return blockchainPoetMessage.prefix === this.configuration.poetNetwork
  }

  private blockchainPoetMessageVersionMatches = (blockchainPoetMessage: BlockchainPoetTimestamp) => {
    if (blockchainPoetMessage.version.length !== this.configuration.poetVersion.length)
      return false
    for (let i = 0; i < blockchainPoetMessage.version.length; i++)
      if (blockchainPoetMessage.version[i] !== this.configuration.poetVersion[i])
        return false
    return true
  }
}

import { InsightClient } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { getPoetTimestamp } from 'Helpers/Bitcoin'
import { childWithFileName } from 'Helpers/Logging'
import { PoetTimestamp } from 'Interfaces'
import { Messaging } from 'Messaging/Messaging'

import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly insightHelper: InsightClient
  private readonly configuration: ClaimControllerConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('InsightHelper') insightHelper: InsightClient,
    @inject('ClaimControllerConfiguration') configuration: ClaimControllerConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.messaging = messaging
    this.insightHelper = insightHelper
    this.configuration = configuration
    this.collection = this.db.collection('blockchainReader')
  }

  async scanBlock(blockHeight: number): Promise<void> {
    const logger = this.logger.child({ method: 'scanBlock' })

    logger.trace({ blockHeight }, 'Retrieving Block Hash...')

    const blockHash = await this.insightHelper.getBlockHash(blockHeight)

    logger.trace(
      {
        blockHeight,
        blockHash,
      },
      'Block Hash retrieved successfully. Retrieving Raw Block...'
    )

    const block = await this.insightHelper.getBlock(blockHash)
    const poetTimestamps: ReadonlyArray<PoetTimestamp> = block.transactions
      .map(getPoetTimestamp)
      .filter(_ => _)
      .map(_ => ({
        ..._,
        blockHeight,
        blockHash,
      }))
    const transactionIds = block.transactions.map(_ => _.id)

    const matchingPoetTimestamps = poetTimestamps
      .filter(this.poetTimestampNetworkMatches)
      .filter(this.poetTimestampVersionMatches)

    const unmatchingPoetTimestamps = poetTimestamps.filter(_ => !matchingPoetTimestamps.includes(_))

    logger.trace(
      {
        blockHeight,
        blockHash,
        matchingPoetTimestamps,
        unmatchingPoetTimestamps,
      },
      'Raw Block retrieved and scanned successfully'
    )

    await this.collection.updateOne(
      { blockHeight },
      {
        $set: {
          blockHash,
          transactionIds,
          matchingPoetTimestamps,
          unmatchingPoetTimestamps,
        },
      },
      { upsert: true }
    )

    if (matchingPoetTimestamps.length) await this.messaging.publishPoetTimestampsDownloaded(matchingPoetTimestamps)
  }

  /**
   * @returns {Promise<number>} The highest block height from the database, or null if no block has been processed.
   */
  async findHighestBlockHeight(): Promise<number> {
    const logger = this.logger.child({ method: 'findHighestBlockHeight' })

    const queryResults = await this.collection
      .find({}, { projection: { blockHeight: true, _id: 0 } })
      .sort({ blockHeight: -1 })
      .limit(1)
      .toArray()
    const highestBlockHeight = (queryResults && !!queryResults.length && queryResults[0].blockHeight) || null

    logger.info({ highestBlockHeight }, 'Retrieved Height of Highest Block Scanned So Far')

    return highestBlockHeight
  }

  private poetTimestampNetworkMatches = (blockchainPoetMessage: PoetTimestamp) => {
    return blockchainPoetMessage.prefix === this.configuration.poetNetwork
  }

  private poetTimestampVersionMatches = (blockchainPoetMessage: PoetTimestamp) => {
    if (blockchainPoetMessage.version.length !== this.configuration.poetVersion.length) return false
    for (let i = 0; i < blockchainPoetMessage.version.length; i++)
      if (blockchainPoetMessage.version[i] !== this.configuration.poetVersion[i]) return false
    return true
  }
}

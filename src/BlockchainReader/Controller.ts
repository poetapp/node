import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { filter, reject } from 'ramda'

import { Block, GetBlockVerbosity } from 'Helpers/Bitcoin'
import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { anchorPrefixAndVersionMatch, blockToPoetAnchors } from './Bitcoin'
import { DAO } from './DAO'

export interface ControllerConfiguration {
  readonly poetNetwork: string
  readonly poetVersion: number
}

@injectable()
export class Controller {
  private readonly logger: Pino.Logger
  private readonly dao: DAO
  private readonly messaging: Messaging
  private readonly bitcoinCore: BitcoinCore
  private readonly configuration: ControllerConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DAO') dao: DAO,
    @inject('Messaging') messaging: Messaging,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('ClaimControllerConfiguration') configuration: ControllerConfiguration,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.dao = dao
    this.messaging = messaging
    this.bitcoinCore = bitcoinCore
    this.configuration = configuration
  }

  async scanBlock(blockHeight: number): Promise<void> {
    const logger = this.logger.child({ method: 'scanBlock' })

    logger.debug({ blockHeight }, 'Retrieving Block Hash')

    const blockHash = await this.bitcoinCore.getBlockHash(blockHeight)

    logger.trace(
      {
        blockHeight,
        blockHash,
      },
      'Block Hash retrieved successfully. Retrieving Raw Block',
    )

    const block: Block = await this.bitcoinCore.getBlock(blockHash, GetBlockVerbosity.Transactions)

    const anchors = blockToPoetAnchors(block)

    const anchorPrefixAndVersionMatchConfiguration = anchorPrefixAndVersionMatch(
      this.configuration.poetNetwork,
      this.configuration.poetVersion,
    )

    const matchingAnchors = filter(anchorPrefixAndVersionMatchConfiguration, anchors)
    const unmatchingAnchors = reject(anchorPrefixAndVersionMatchConfiguration, anchors)

    const previousBlockHash = block.previousblockhash

    const localPreviousHash = await this.dao.findHashByHeight(blockHeight - 1)

    logger.trace(
      {
        blockHash,
        blockHeight,
        previousBlockHash,
        localPreviousHash,
        matchingAnchors,
        unmatchingAnchors,
      },
      'Block retrieved and scanned successfully',
    )

    if (localPreviousHash && localPreviousHash !== previousBlockHash)
      logger.warn(
        {
          blockHash,
          blockHeight,
          previousBlockHash,
          localPreviousHash,
        },
        'Fork detected',
      )

    await this.dao.upsertEntryByHash({
      blockHash,
      blockHeight,
      previousBlockHash,
      matchingAnchors,
      unmatchingAnchors,
    })

    await this.messaging.publishBlockDownloaded({
      block: {
        hash: block.hash,
        height: block.height,
        previousHash: block.previousblockhash,
      },
      poetBlockAnchors: matchingAnchors,
    })
  }

  async findHighestBlockHeight(): Promise<number | null> {
    const logger = this.logger.child({ method: 'findHighestBlockHeight' })

    const highestBlockHeight = await this.dao.findHighestBlockHeight()

    logger.info({ highestBlockHeight }, 'Retrieved Height of Highest Block Scanned So Far')

    return highestBlockHeight
  }
}

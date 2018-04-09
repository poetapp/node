import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { BlockHeightOutOfRangeError, Interval } from 'poet-js'

import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { ClaimController } from './ClaimController'

@injectable()
export class BlockchainReaderService {
  private readonly logger: Pino.Logger
  private readonly claimController: ClaimController
  private readonly configuration: BlockchainReaderServiceConfiguration
  private readonly interval: Interval
  private lastBlockHeight: number

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('ClaimController') claimController: ClaimController,
    @inject('BlockchainReaderServiceConfiguration') configuration: BlockchainReaderServiceConfiguration,
  ) {
    this.claimController = claimController
    this.configuration = configuration
    this.interval = new Interval(this.scanNewBlock, this.configuration.blockchainReaderIntervalInSeconds * 1000)
    this.logger = logger
  }

  async start() {
    const lastBlockHeight = await this.claimController.findHighestBlockHeight()
    this.lastBlockHeight = this.configuration.forceBlockHeight || lastBlockHeight || this.configuration.minimumBlockHeight
    this.interval.start()
  }

  stop() {
    this.interval.stop()
  }

  private scanNewBlock = async () => {
    const blockHeight = this.configuration.forceBlockHeight || this.lastBlockHeight + 1
    try {
      await this.claimController.scanBlock(blockHeight)
      this.lastBlockHeight = blockHeight
    } catch (error) {
      if (error instanceof BlockHeightOutOfRangeError)
        this.logger.warn({
          action: 'Scan New Block',
          blockHeight,
        }, 'BlockHeightOutOfRangeError - Probably Reached Blockchain Tip')
      else
        this.logger.error({
          action: 'Scan New Block',
          type: error.constructor.name,
          stack: error.stack.split('\n'),
          blockHeight,
          lastBlockHeight: this.lastBlockHeight,
        }, 'Uncaught Error')
    }
  }
}

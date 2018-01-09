import { inject, injectable } from 'inversify'
import { BlockHeightOutOfRangeError, Interval } from 'poet-js'

import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { ClaimController } from './ClaimController'

@injectable()
export class BlockchainReaderService {
  private readonly claimController: ClaimController
  private readonly configuration: BlockchainReaderServiceConfiguration
  private readonly interval: Interval
  private lastBlockHeight: number

  constructor(
    @inject('ClaimController') claimController: ClaimController,
    @inject('BlockchainReaderServiceConfiguration') configuration: BlockchainReaderServiceConfiguration
  ) {
    this.claimController = claimController
    this.configuration = configuration
    this.interval = new Interval(this.scanNewBlock, this.configuration.blockchainReaderIntervalInSeconds * 1000)
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
      if (error instanceof BlockHeightOutOfRangeError) {
        console.log(JSON.stringify({
          action: 'Scan New Block',
          message: 'BlockHeightOutOfRangeError - Probably Reached Blockchain Tip',
          blockHeight,
        }, null, 2))
        return
      }
      console.error(JSON.stringify({
        action: 'Scan New Block',
        message: 'Uncaught Error',
        type: error.constructor.name,
        stack: error.stack.split('\n'),
        blockHeight,
        lastBlockHeight: this.lastBlockHeight,
      }, null, 2))
    }
  }
}

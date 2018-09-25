import { Interval } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

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
    @inject('BlockchainReaderServiceConfiguration') configuration: BlockchainReaderServiceConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.claimController = claimController
    this.configuration = configuration
    this.interval = new Interval(this.scanNewBlock, this.configuration.blockchainReaderIntervalInSeconds * 1000)
  }

  async start() {
    const lastBlockHeight = await this.claimController.findHighestBlockHeight()
    this.lastBlockHeight =
      this.configuration.forceBlockHeight || lastBlockHeight || this.configuration.minimumBlockHeight
    this.interval.start()
  }

  stop() {
    this.logger.info('BlockchainReader Cron Stopping...')
    this.interval.stop()
  }

  private scanNewBlock = async () => {
    const logger = this.logger.child({ method: 'scanNewBlock' })

    const blockHeight = this.configuration.forceBlockHeight || this.lastBlockHeight + 1
    try {
      await this.claimController.scanBlock(blockHeight)
      this.lastBlockHeight = blockHeight
    } catch (error) {
      if (error.message === 'Block height out of range') logger.warn({ blockHeight }, error.message)
      else
        logger.error(
          {
            error,
            blockHeight,
            lastBlockHeight: this.lastBlockHeight,
          },
          'Uncaught Error'
        )
    }
  }
}

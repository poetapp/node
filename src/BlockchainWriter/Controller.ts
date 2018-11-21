import { PoetAnchor, StorageProtocol } from '@po.et/poet-js'
import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { LightBlock } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { poetAnchorToData } from './Bitcoin'
import { DAO, Entry } from './DAO'
import { translateFundTransactionError } from './Exceptions'
import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface ControllerConfiguration {
  readonly poetNetwork: string
  readonly poetVersion: number
  readonly maximumTransactionAgeInBlocks: number
}

export const convertLightBlockToEntry = (lightBlock: LightBlock): Entry => ({
  blockHeight: lightBlock.height,
  blockHash: lightBlock.hash,
})

@injectable()
export class Controller {
  private readonly logger: Pino.Logger
  private readonly dao: DAO
  private readonly messaging: Messaging
  private readonly bitcoinCore: BitcoinCore
  private readonly configuration: ControllerConfiguration
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DAO') dao: DAO,
    @inject('Messaging') messaging: Messaging,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('ClaimControllerConfiguration') configuration: ControllerConfiguration,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.bitcoinCore = bitcoinCore
    this.configuration = configuration
    this.dao = dao
    this.exchange = exchange
  }

  async requestAnchor(ipfsDirectoryHash: string): Promise<void> {
    this.logger.debug({
      method: 'requestAnchor',
      ipfsDirectoryHash,
    })
    await this.dao.insertIpfsDirectoryHash(ipfsDirectoryHash)
  }

  async anchorNextIPFSDirectoryHash() {
    const logger = this.logger.child({ method: 'anchorNextHash' })

    logger.trace('Retrieving Next Hash To Anchor')

    const entry = await this.dao.findTransactionlessEntry()
    const ipfsDirectoryHash = entry && entry.ipfsDirectoryHash

    this.logger.trace({ ipfsDirectoryHash }, 'Next IPFS Directory Hash To Anchor Retrieved')

    if (!ipfsDirectoryHash) return

    try {
      await this.anchorIPFSDirectoryHash(ipfsDirectoryHash)
    } catch (exception) {
      logger.error(
        {
          ipfsDirectoryHash,
          exception,
        },
        'Unexpected Exception While Anchoring IPFS Directory Hash',
      )
    }
  }

  async setBlockInformationForTransactions(
    transactionIds: ReadonlyArray<string>,
    lightBlock: LightBlock,
  ): Promise<void> {
    const logger = this.logger.child({ method: 'setBlockInformationForTransactions'})

    logger.debug({ transactionIds, lightBlock }, 'Setting Block Info for transactions')

    await this.dao.updateAllByTransactionId(transactionIds, convertLightBlockToEntry(lightBlock))
  }

  async purgeStaleTransactions(): Promise<void> {
    const logger = this.logger.child({ method: 'purgeStaleTransactions' })
    const { blocks } = await this.bitcoinCore.getBlockchainInfo()
    logger.info(
      {
        blocks, maximumTransactionAgeInBlocks: this.configuration.maximumTransactionAgeInBlocks
      },
      'Purging stale transactions',
    )

    try {
      await this.dao.purgeStaleTransactions(blocks - this.configuration.maximumTransactionAgeInBlocks)
    } catch (exception) {
      logger.error({ exception }, 'purgeStaleTransactions')
    }
  }

  private async anchorIPFSDirectoryHash(ipfsDirectoryHash: string): Promise<void> {
    const { dao, messaging, anchorData, ipfsDirectoryHashToPoetAnchor } = this
    const logger = this.logger.child({ method: 'anchorIPFSDirectoryHash' })

    logger.debug({ ipfsDirectoryHash }, 'Anchoring IPFS Hash')

    const poetAnchor = ipfsDirectoryHashToPoetAnchor(ipfsDirectoryHash)

    logger.trace({ ipfsDirectoryHash, poetAnchor }, 'Anchoring IPFS Hash')

    const data = poetAnchorToData(poetAnchor)
    const txId = await anchorData(data)
    const blockInfo = await this.bitcoinCore.getBlockchainInfo()
    logger.trace({ blockInfoBlocks: blockInfo.blocks }, 'blockInfo.blocks')

    await dao.updateByIPFSDirectoryHash({
      ipfsDirectoryHash,
      txId,
      transactionCreationDate: new Date(),
      creationBlockHeight: blockInfo.blocks,
    })

    await messaging.publish(this.exchange.ipfsHashTxId, {
      ipfsDirectoryHash,
      txId,
    })
  }

  private anchorData = async (data: string) => {
    const { bitcoinCore } = this
    const logger = this.logger.child({ method: 'anchorData' })

    const rawTransaction = await bitcoinCore.createRawTransaction([], { data })

    logger.trace(
      {
        rawTransaction,
      },
      'Got rawTransaction from Bitcoin Core',
    )

    const fundedTransaction = await bitcoinCore.fundRawTransaction(rawTransaction).catch(translateFundTransactionError)

    logger.trace(
      {
        fundedTransaction,
      },
      'Got fundedTransaction from Bitcoin Core',
    )

    const signedTransaction = await bitcoinCore.signRawTransaction(fundedTransaction.hex)

    logger.trace(
      {
        signedTransaction,
      },
      'Got signedTransaction from Bitcoin Core',
    )

    const sentTransaction = await bitcoinCore.sendRawTransaction(signedTransaction.hex)

    logger.trace(
      {
        sentTransaction,
      },
      'Got sentTransaction from Bitcoin Core',
    )

    return sentTransaction
  }

  private ipfsDirectoryHashToPoetAnchor = (ipfsDirectoryHash: string): PoetAnchor => ({
    prefix: this.configuration.poetNetwork,
    version: this.configuration.poetVersion,
    storageProtocol: StorageProtocol.IPFS,
    ipfsDirectoryHash,
  })
}

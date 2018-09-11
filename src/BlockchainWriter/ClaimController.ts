import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { getData } from './Bitcoin'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly bitcoinCore: BitcoinCore
  private readonly configuration: ClaimControllerConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('ClaimControllerConfiguration') configuration: ClaimControllerConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.messaging = messaging
    this.bitcoinCore = bitcoinCore
    this.configuration = configuration
    this.collection = this.db.collection('blockchainWriter')
  }

  async requestTimestamp(ipfsDirectoryHash: string): Promise<void> {
    this.logger.debug({
      method: 'timestampWithRetry',
      ipfsDirectoryHash,
    })
    await this.collection.insertOne({
      ipfsDirectoryHash,
      txId: null,
    })
  }

  async anchorNextIPFSDirectoryHash() {
    const logger = this.logger.child({ method: 'anchorNextHash' })

    logger.trace('Retrieving Next Hash To Anchor')

    const entry = await this.collection.findOne({ txId: null })
    const ipfsDirectoryHash = entry && entry.ipfsDirectoryHash

    this.logger.trace({ ipfsDirectoryHash }, 'Next IPFS Directory Hash To Anchor Retrieved')

    if (!ipfsDirectoryHash) return

    try {
      await this.anchorIPFSDirectoryHash(ipfsDirectoryHash)
    } catch (exception) {
      logger.warn(
        {
          ipfsDirectoryHash,
          exception,
        },
        'Unexpected Exception While Anchoring IPFS Directory Hash'
      )
    }
  }

  private async anchorIPFSDirectoryHash(ipfsDirectoryHash: string): Promise<void> {
    const { configuration, collection, messaging, anchorData } = this
    const logger = this.logger.child({ method: 'anchorIPFSDirectoryHash' })

    logger.debug({ ipfsDirectoryHash }, 'Anchoring IPFS Hash')

    const ipfsDirectoryHashToBitcoinData = getData(configuration.poetNetwork, configuration.poetVersion)

    const data = ipfsDirectoryHashToBitcoinData(ipfsDirectoryHash)
    const txId = await anchorData(data)

    await collection.updateOne({ ipfsDirectoryHash }, { $set: { txId } }, { upsert: true })
    await messaging.publish(Exchange.IPFSHashTxId, {
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
      'Got rawTransaction from Bitcoin Core'
    )

    const fundedTransaction = await bitcoinCore.fundRawTransaction(rawTransaction)

    logger.trace(
      {
        fundedTransaction,
      },
      'Got fundedTransaction from Bitcoin Core'
    )

    const signedTransaction = await bitcoinCore.signRawTransaction(fundedTransaction.hex)

    logger.trace(
      {
        signedTransaction,
      },
      'Got signedTransaction from Bitcoin Core'
    )

    const sentTransaction = await bitcoinCore.sendRawTransaction(signedTransaction.hex)

    logger.trace(
      {
        sentTransaction,
      },
      'Got sentTransaction from Bitcoin Core'
    )

    return sentTransaction
  }
}

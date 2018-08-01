import { InsightClient } from '@po.et/poet-js'
import * as bitcore from 'bitcore-lib'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
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
    @inject('InsightHelper') insightClient: InsightClient,
    @inject('ClaimControllerConfiguration') configuration: ClaimControllerConfiguration
  ) {
    if (!configuration.bitcoinAddress) throw new Error('configuration.bitcoinAddress is required.')
    if (!configuration.bitcoinAddressPrivateKey) throw new Error('configuration.bitcoinAddressPrivateKey is required.')

    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.messaging = messaging
    this.insightHelper = insightClient
    this.configuration = configuration
    this.collection = this.db.collection('blockchainWriter')
  }

  async requestTimestamp(ipfsDirectoryHash: string): Promise<void> {
    this.logger.trace({
      method: 'timestampWithRetry',
      ipfsDirectoryHash,
    })
    await this.collection.insertOne({
      ipfsDirectoryHash,
      txId: null,
    })
  }

  async timestampNextHash() {
    const logger = this.logger.child({ method: 'timestampNextHash' })

    logger.trace('Retrieving Next Hash To Timestamp')

    const entry = await this.collection.findOne({ txId: null })
    const ipfsDirectoryHash = entry && entry.ipfsDirectoryHash

    this.logger.trace({ ipfsDirectoryHash }, 'Next Hash To Timestamp Retrieved')

    if (!ipfsDirectoryHash) return

    try {
      await this.timestamp(ipfsDirectoryHash)
    } catch (exception) {
      logger.warn(
        {
          ipfsDirectoryHash,
          exception,
        },
        'Uncaught Exception While Timestamping Hash'
      )
    }
  }

  private async timestamp(ipfsDirectoryHash: string): Promise<void> {
    const logger = this.logger.child({ method: 'timestamp' })

    logger.trace({ ipfsDirectoryHash }, 'Timestamping IPFS Hash')

    const utxo = await this.insightHelper.getUtxo(this.configuration.bitcoinAddress)

    if (!utxo || !utxo.length)
      throw new Error(`Wallet seems to be empty. Check funds for ${this.configuration.bitcoinAddress}`)

    // Use only up to 5 unused outputs to avoid large transactions,
    // picking the ones with the most satoshis to ensure enough fee.
    const topUtxo = utxo
      .slice()
      .sort((a, b) => b.satoshis - a.satoshis)
      .slice(0, 5)

    logger.trace(
      {
        address: this.configuration.bitcoinAddress,
        utxo,
      },
      'Got UTXO from Insight'
    )

    const data = Buffer.concat([
      Buffer.from(this.configuration.poetNetwork),
      Buffer.from([...this.configuration.poetVersion]),
      Buffer.from(ipfsDirectoryHash),
    ])
    const tx = new bitcore.Transaction()
      .from(topUtxo)
      .change(this.configuration.bitcoinAddress)
      .addData(data)
      .sign(this.configuration.bitcoinAddressPrivateKey)

    logger.trace(
      {
        address: this.configuration.bitcoinAddress,
        txHash: tx.hash,
      },
      'Transaction Built'
    )

    const txPostResponse = await this.insightHelper.broadcastTx(tx)

    logger.info(
      {
        txHash: tx.hash,
        txId: tx.id,
        txPostResponse,
      },
      'Transaction Broadcasted'
    )

    await this.collection.updateOne({ ipfsDirectoryHash }, { $set: { txId: tx.id } }, { upsert: true })
    await this.messaging.publish(Exchange.IPFSHashTxId, {
      ipfsDirectoryHash,
      txId: tx.id,
    })
  }
}

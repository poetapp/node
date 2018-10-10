import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { IPFSHashFailure } from 'Interfaces'
import { IPFS } from './IPFS'

@injectable()
export class HealthController {
  private readonly db: Db
  private readonly collection: Collection
  private readonly bitcoinCore: BitcoinCore
  private readonly logger: Pino.Logger
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('health')
    this.bitcoinCore = bitcoinCore
    this.ipfs = ipfs
  }

  async checkIpfsConnection(): Promise<any> {
    this.logger.trace('Checking IPFS...')
    const connection = await this.ipfs.checkHealth()
    const ipfsIsConnected = connection === 200
    await this.collection.updateOne(
      { name: 'ipfsConnected' },
      {
        $set: {
          ipfsIsConnected,
        },
      },
      { upsert: true }
    )
  }

  async getBlockchainInfo(): Promise<void> {
    const logger = this.logger.child({ method: 'getBlockchainInfo' })

    const {
      blocks,
      verificationprogress,
      bestblockhash,
      warnings,
      size_on_disk,
    } = await this.bitcoinCore.getBlockchainInfo()
    const blockchainInfo = { blocks, verificationprogress, bestblockhash, warnings, size_on_disk }
    logger.trace(
      {
        blockchainInfo,
      },
      'Blockchain Info retrieved successfully.'
    )
    await this.collection.updateOne(
      { name: 'blockchainInfo' },
      {
        $set: {
          blockchainInfo,
        },
      },
      { upsert: true }
    )
  }

  async getWalletInfo(): Promise<void> {
    const logger = this.logger.child({ method: 'getBalance' })

    const { balance, txcount } = await this.bitcoinCore.getWalletInfo()
    const walletInfo = { balance, txcount }
    logger.trace(
      {
        walletInfo,
      },
      'Bitcoin walletInfo retrieved successfully.'
    )
    await this.collection.updateOne(
      { name: 'walletInfo' },
      {
        $set: {
          walletInfo,
        },
      },
      { upsert: true }
    )
  }

  async getNetworkInfo(): Promise<void> {
    const logger = this.logger.child({ method: 'getBalance' })

    const {
      version,
      subversion,
      connections,
      networkactive,
      protocolversion,
      warnings,
    } = await this.bitcoinCore.getNetworkInfo()
    const networkInfo = { version, subversion, connections, networkactive, protocolversion, warnings }
    logger.trace(
      {
        networkInfo,
      },
      'Bitcoin network info retrieved successfully.'
    )
    await this.collection.updateOne(
      { name: 'networkInfo' },
      {
        $set: {
          networkInfo,
        },
      },
      { upsert: true }
    )
  }

  async updateIPFSFailures(ipfsHashFailures: ReadonlyArray<IPFSHashFailure>) {
    this.logger.debug({ ipfsHashFailures }, 'Updating IPFS Failures by IPFS Hash')
    const ipfsHashFailuresHashExisting = await Promise.all(
      ipfsHashFailures.map(async ({ ipfsFileHash, failureType, failureReason, failureTime }) => {
        const hashExisting = await this.collection.findOne({
          name: 'ipfsDownloadRetries',
          'ipfsDownloadRetries.ipfsFileHash': ipfsFileHash,
        })
        return { ipfsFileHash, failureType, failureReason, failureTime, hashExisting }
      })
    )
    await Promise.all(
      ipfsHashFailuresHashExisting.map(
        async ({ ipfsFileHash, failureReason, failureType, failureTime, hashExisting }) => {
          if (!hashExisting)
            await this.collection.updateOne(
              { name: 'ipfsDownloadRetries' },
              {
                $push: {
                  ipfsDownloadRetries: {
                    ipfsFileHash,
                    failureReason,
                    failureType,
                    lastDownloadAttemptTime: failureTime,
                    downloadAttempts: 1,
                  },
                },
              }
            )
          else
            await this.collection.updateOne(
              { name: 'ipfsDownloadRetries', 'ipfsDownloadRetries.ipfsFileHash': ipfsFileHash },
              {
                $set: {
                  'ipfsDownloadRetries.$.failureReason': failureReason,
                  'ipfsDownloadRetries.$.failureType': failureType,
                  'ipfsDownloadRetries.$.lastDownloadAttemptTime': failureTime,
                },
                $inc: { 'ipfsDownloadRetries.$.downloadAttempts': 1 },
              }
            )
        }
      )
    )
    return ipfsHashFailures
  }

  async upsertIPFSFailures(ipfsHashFailures: ReadonlyArray<IPFSHashFailure>) {
    this.logger.debug({ ipfsHashFailures }, 'Inserting IPFS Failures')
    const existing = await this.collection.findOne({ name: 'ipfsDownloadRetries' })
    if (!existing)
      await Promise.all(
        ipfsHashFailures.map(async ({ failureReason, failureType, ipfsFileHash, failureTime }) => {
          await this.collection.insertOne({
            name: 'ipfsDownloadRetries',
            ipfsDownloadRetries: [
              { ipfsFileHash, failureReason, failureType, lastDownloadAttemptTime: failureTime, downloadAttempts: 1 },
            ],
          })
        })
      )
    else await this.updateIPFSFailures(ipfsHashFailures)
    return ipfsHashFailures
  }
}

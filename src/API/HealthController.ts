import { AnchorRetryReport } from 'Interfaces'
import { Db, Collection } from 'mongodb'

import { IPFSDirectoryHashDAO } from './IPFSDirectoryHashDAO'

export const isOkOne = ({ ok }: { ok: number }) => ok === 1

interface HealthObject {
  readonly mongoIsConnected: boolean
  readonly ipfsInfo: object
  readonly walletInfo: object
  readonly blockchainInfo: object
  readonly networkInfo: object
  readonly estimatedSmartFeeInfo: object
  readonly ipfsRetryInfo: object
  readonly transactionAnchorRetryInfo: AnchorRetryReport | Error
}

interface Error {
  error: string
}

export interface Dependencies {
  readonly db: Db
  readonly ipfsDireactoryHashDAO: IPFSDirectoryHashDAO
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class HealthController {
  private readonly db: Db
  private readonly collection: Collection
  private readonly ipfsDirectoryHashDAO: IPFSDirectoryHashDAO

  constructor({
    dependencies: {
      db,
      ipfsDireactoryHashDAO,
    },
  }: Arguments) {
    this.db = db
    this.collection = this.db.collection('health')
    this.ipfsDirectoryHashDAO = ipfsDireactoryHashDAO
  }

  private async checkMongo(): Promise<boolean> {
    try {
      const mongoConnection = await this.db.stats()
      return isOkOne(mongoConnection)
    } catch (e) {
      return false
    }
  }

  private async getIPFSInfo(): Promise<object> {
    try {
      const { ipfsInfo = {} } = await this.collection.findOne({ name: 'ipfsInfo' })
      return ipfsInfo
    } catch (e) {
      return { error: 'Error retrieving IPFSInfo...' }
    }
  }

  private async getBlockchainInfo(): Promise<object> {
    try {
      const { blockchainInfo = {} } = await this.collection.findOne({ name: 'blockchainInfo' })
      return blockchainInfo
    } catch (e) {
      return { error: 'Error retrieving blockchainInfo...' }
    }
  }

  private async getWalletInfo(): Promise<object> {
    try {
      const { walletInfo = {} } = await this.collection.findOne({ name: 'walletInfo' })
      return walletInfo
    } catch (e) {
      return { error: 'Error retrieving walletInfo...' }
    }
  }

  private async getNetworkInfo(): Promise<object> {
    try {
      const { networkInfo = {} } = await this.collection.findOne({ name: 'networkInfo' })
      return networkInfo
    } catch (e) {
      return { error: 'Error retrieving networkInfo...' }
    }
  }

  private async getEstimatedSmartFeeInfo(): Promise<object> {
    try {
      const { estimatedSmartFeeInfo = {} } = await this.collection.findOne({ name: 'estimatedSmartFeeInfo' })
      return estimatedSmartFeeInfo
    } catch (e) {
      return { error: 'Error retrieving estimatedSmartFeeInfo...' }
    }
  }

  private async getIPFSRetryInfo(): Promise<object> {
    try {
      const {
        hardFailures = 0,
        softFailures = 0,
      } = await this.collection.findOne({ name: 'ipfsDownloadRetries' }) || {}
      const ipfsRetryInfo = { hardFailures, softFailures }
      return ipfsRetryInfo
    } catch (e) {
      return { error: 'Error retrieving ipfsRetryInfo...' }
    }
  }

  private async getTransactionAnchorRetryReport(): Promise<AnchorRetryReport | Error> {
    try {
      return await this.ipfsDirectoryHashDAO.getAnchorRetryHealth()
    } catch (e) {
      return { error: 'Error retrieving transactionAnchorRetryReport' }
    }
  }

  async getHealth(): Promise<HealthObject> {
    const mongoIsConnected = await this.checkMongo()
    const ipfsInfo = await this.getIPFSInfo()
    const walletInfo = await this.getWalletInfo()
    const blockchainInfo = await this.getBlockchainInfo()
    const networkInfo = await this.getNetworkInfo()
    const estimatedSmartFeeInfo = await this.getEstimatedSmartFeeInfo()
    const ipfsRetryInfo = await this.getIPFSRetryInfo()
    const transactionAnchorRetryInfo = await this.getTransactionAnchorRetryReport()
    return {
      mongoIsConnected,
      ipfsInfo,
      walletInfo,
      blockchainInfo,
      networkInfo,
      estimatedSmartFeeInfo,
      ipfsRetryInfo,
      transactionAnchorRetryInfo,
    }
  }
}

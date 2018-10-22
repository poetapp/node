import { inject, injectable } from 'inversify'
import { Db, Collection } from 'mongodb'

export const isOkOne = ({ ok }: { ok: number }) => ok === 1

interface HealthObject {
  readonly mongoIsConnected: boolean
  readonly ipfsInfo: object
  readonly walletInfo: object
  readonly blockchainInfo: object
  readonly networkInfo: object
  readonly ipfsDownloadRetries: ReadonlyArray<object>
  readonly ipfsFailureMaxRetries: ReadonlyArray<object>
  readonly ipfsFailureWillRetry: ReadonlyArray<object>
  readonly hardIpfsFailures: ReadonlyArray<object>
}

export interface HealthControllerConfiguration {
  readonly downloadMaxAttempts: number
}

@injectable()
export class HealthController {
  private readonly configuration: HealthControllerConfiguration
  private readonly db: Db
  private readonly collection: Collection

  constructor(
    @inject('DB') db: Db,
    @inject('HealthControllerConfiguration') configuration: HealthControllerConfiguration) {
    this.configuration = configuration
    this.db = db
    this.collection = this.db.collection('health')
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

  async getHealth(): Promise<HealthObject> {
    const mongoIsConnected = await this.checkMongo()
    const ipfsInfo = await this.getIPFSInfo()
    const walletInfo = await this.getWalletInfo()
    const blockchainInfo = await this.getBlockchainInfo()
    const networkInfo = await this.getNetworkInfo()
    const { ipfsDownloadRetries } = (await this.collection.findOne({ name: 'ipfsDownloadRetries' })) || {
      ipfsDownloadRetries: 'No IFPS Download Retries',
    }
    const { ipfsDownloadRetries: hardIpfsFailures } = (await this.collection.findOne(
      { name: 'ipfsDownloadRetries' },
      { projection: { _id: 0, ipfsDownloadRetries: { $elemMatch: { failureType: 'HARD' } } } }
    )) || { ipfsDownloadRetries: 'No IFPS Download Retries' }
    const { ipfsDownloadRetries: ipfsFailureWillRetry } = (await this.collection.findOne(
      { name: 'ipfsDownloadRetries' },
      {
        projection: {
          _id: 0,
          ipfsDownloadRetries: {
            $elemMatch: {
              failureType: { $ne: 'HARD' },
              downloadAttempts: { $not: { $gte: this.configuration.downloadMaxAttempts } },
            },
          },
        },
      }
    )) || { ipfsDownloadRetries: 'No IFPS Download Retries' }
    const { ipfsDownloadRetries: ipfsFailureMaxRetries } = (await this.collection.findOne(
      { name: 'ipfsDownloadRetries' },
      {
        projection: {
          _id: 0,
          ipfsDownloadRetries: {
            $elemMatch: {
              failureType: { $ne: 'HARD' },
              downloadAttempts: { $gte: this.configuration.downloadMaxAttempts },
            },
          },
        },
      }
    )) || { ipfsDownloadRetries: 'No IFPS Download Retries' }
    return {
      mongoIsConnected,
      ipfsInfo,
      walletInfo,
      blockchainInfo,
      networkInfo,
      ipfsDownloadRetries,
      ipfsFailureMaxRetries,
      ipfsFailureWillRetry,
      hardIpfsFailures
    }
  }
}

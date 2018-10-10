import { inject, injectable } from 'inversify'
import { Db, Collection } from 'mongodb'

import { HealthControllerConfiguration } from './HealthControllerConfiguration'

@injectable()
export class HealthController {
  private readonly db: Db
  private readonly collection: Collection
  private readonly configuration: HealthControllerConfiguration

  constructor(
    @inject('DB') db: Db,
    @inject('HealthControllerConfiguration') configuration: HealthControllerConfiguration
  ) {
    this.db = db
    this.collection = this.db.collection('health')
    this.configuration = configuration
  }

  async getHealth(): Promise<any> {
    const connection = await this.db.stats();
    const mongoIsConnected = connection.ok === 1
    const { ipfsIsConnected } = (await this.collection.findOne({ name: 'ipfsConnected' })) || {
      ipfsIsConnected: 'Checking IPFS Connection...',
    }
    const { blockchainInfo } = (await this.collection.findOne({ name: 'blockchainInfo' })) || {
      blockchainInfo: 'Getting Blockchain Info...',
    }
    const { walletInfo } = (await this.collection.findOne({ name: 'walletInfo' })) || {
      walletInfo: 'Getting Wallet Info...',
    }
    const { networkInfo } = (await this.collection.findOne({ name: 'networkInfo' })) || {
      networkInfo: 'Getting Network Info...',
    }
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
      ipfsIsConnected,
      blockchainInfo,
      walletInfo,
      networkInfo,
      ipfsDownloadRetries,
      hardIpfsFailures,
      ipfsFailureWillRetry,
      ipfsFailureMaxRetries,
    }
  }
}

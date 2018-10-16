import { inject, injectable } from 'inversify'
import { Db, Collection } from 'mongodb'

import { IPFS } from './IPFS'

export const isOkOne = ({ ok }: { ok: number }) => ok === 1
export const isStatus200 = ({ status }: { status: number }) => status === 200

interface HealthObject {
  readonly mongoIsConnected: boolean
  readonly ipfsIsConnected: boolean
  readonly walletInfo: object
  readonly blockchainInfo: object
  readonly networkInfo: object
}

@injectable()
export class HealthController {
  private readonly db: Db
  private readonly ipfs: IPFS
  private readonly collection: Collection

  constructor(@inject('DB') db: Db, @inject('IPFS') ipfs: IPFS) {
    this.db = db
    this.ipfs = ipfs
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

  private async checkIPFS(): Promise<boolean> {
    try {
      const ipfsConnection = await this.ipfs.getVersion()
      return isStatus200(ipfsConnection)
    } catch (e) {
      return false
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
    const ipfsIsConnected = await this.checkIPFS()
    const walletInfo = await this.getWalletInfo()
    const blockchainInfo = await this.getBlockchainInfo()
    const networkInfo = await this.getNetworkInfo()
    return {
      mongoIsConnected,
      ipfsIsConnected,
      walletInfo,
      blockchainInfo,
      networkInfo,
    }
  }
}

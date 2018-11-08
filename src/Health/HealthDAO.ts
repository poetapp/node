import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

export interface BlockchainInfo {
  readonly blocks: number
  readonly verificationprogress: number
  readonly bestblockhash: string
  readonly warnings: string
  readonly size_on_disk: number
}

export interface WalletInfo {
  readonly balance: number
  readonly txcount: number
  readonly balanceLow?: boolean
}

export interface NetworkInfo {
  readonly version: number
  readonly subversion: string
  readonly connections: number
  readonly networkactive: boolean
  readonly protocolversion: number
  readonly warnings: string
}

export interface EstimatedSmartFeeInfo {
  readonly feerate: number
  readonly blocks: number
}

export interface IPFSInfo {
  readonly ipfsIsConnected: boolean
}

function foo(a: string): boolean
function foo(a: string) { return !a}

type updateBlockchainInfo = (x: BlockchainInfo) => Promise<void>

type updateWalletInfo = (x: WalletInfo) => Promise<void>

type updateNetworkInfo = (x: NetworkInfo) => Promise<void>

type updateIPFSInfo = (x: IPFSInfo) => Promise<void>

type updateEstimatedSmartFeeInfo = (x: EstimatedSmartFeeInfo) => Promise<void>

@injectable()
export class HealthDAO {
  private readonly collection: Collection

  constructor(@inject('DB') db: Db) {
    this.collection = db.collection('health')
  }

  readonly updateBlockchainInfo: updateBlockchainInfo = async blockchainInfo => {
    await this.collection.updateOne(
      { name: 'blockchainInfo' },
      {
        $set: {
          blockchainInfo,
        },
      },
      { upsert: true },
    )
  }

  readonly updateWalletInfo: updateWalletInfo = async walletInfo => {
    await this.collection.updateOne(
      { name: 'walletInfo' },
      {
        $set: {
          walletInfo,
        },
      },
      { upsert: true },
    )
  }

  readonly updateNetworkInfo: updateNetworkInfo = async networkInfo => {
    await this.collection.updateOne(
      { name: 'networkInfo' },
      {
        $set: {
          networkInfo,
        },
      },
      { upsert: true },
    )
  }

  readonly updateIPFSInfo: updateIPFSInfo = async ipfsInfo => {
    await this.collection.updateOne(
      { name: 'ipfsInfo' },
      {
        $set: {
          ipfsInfo,
        },
      },
      { upsert: true },
    )
  }

  readonly updateEstimatedSmartFeeInfo: updateEstimatedSmartFeeInfo = async estimatedSmartFeeInfo => {
    await this.collection.updateOne(
      { name: 'estimatedSmartFeeInfo' },
      {
        $set: {
          estimatedSmartFeeInfo,
        },
      },
      { upsert: true },
    )
  }

  readonly increaseHardIPFSFailure = async (): Promise<void> => {
    await this.collection.updateOne(
      { name: 'ipfsDownloadRetries' },
      {
        $inc: { hardFailures: 1 },
      },
      { upsert: true },
    )
  }

  readonly increaseSoftIPFSFailure = async (): Promise<void> => {
    await this.collection.updateOne(
      { name: 'ipfsDownloadRetries' },
      {
        $inc: { softFailures: 1 },
      },
      { upsert: true },
    )
  }
}

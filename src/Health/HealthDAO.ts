import { inject, injectable } from 'inversify'
import { Collection, Db, UpdateWriteOpResult } from 'mongodb'

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

type updateBlockchainInfo = (x: BlockchainInfo) => void

type updateWalletInfo = (x: WalletInfo) => void

type updateNetworkInfo = (x: NetworkInfo) => void

type updateIPFSInfo = (x: IPFSInfo) => void

type updateEstimatedSmartFeeInfo = (x: EstimatedSmartFeeInfo) => void

@injectable()
export class HealthDAO {
  private readonly collection: Collection

  constructor(@inject('DB') db: Db) {
    this.collection = db.collection('health')
  }

  readonly updateBlockchainInfo: updateBlockchainInfo = blockchainInfo =>
    this.collection.updateOne(
      { name: 'blockchainInfo' },
      {
        $set: {
          blockchainInfo,
        },
      },
      { upsert: true },
    )

  readonly updateWalletInfo: updateWalletInfo = walletInfo =>
    this.collection.updateOne(
      { name: 'walletInfo' },
      {
        $set: {
          walletInfo,
        },
      },
      { upsert: true },
    )

  readonly updateNetworkInfo: updateNetworkInfo = networkInfo =>
    this.collection.updateOne(
      { name: 'networkInfo' },
      {
        $set: {
          networkInfo,
        },
      },
      { upsert: true },
    )

  readonly updateIPFSInfo: updateIPFSInfo = ipfsInfo =>
    this.collection.updateOne(
      { name: 'ipfsInfo' },
      {
        $set: {
          ipfsInfo,
        },
      },
      { upsert: true },
    )

  readonly updateEstimatedSmartFeeInfo: updateEstimatedSmartFeeInfo = estimatedSmartFeeInfo =>
    this.collection.updateOne(
      { name: 'estimatedSmartFeeInfo' },
      {
        $set: {
          estimatedSmartFeeInfo,
        },
      },
      { upsert: true },
    )
}

import { inject, injectable } from 'inversify'
import { Collection, Db, UpdateWriteOpResult, WriteOpResult } from 'mongodb'

import { IPFSHashFailure } from 'Interfaces'

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

type updateBlockchainInfo = (x: BlockchainInfo) => Promise<UpdateWriteOpResult>

type updateWalletInfo = (x: WalletInfo) => Promise<UpdateWriteOpResult>

type updateNetworkInfo = (x: NetworkInfo) => Promise<UpdateWriteOpResult>

type updateIPFSInfo = (x: IPFSInfo) => Promise<UpdateWriteOpResult>

type insertIPFSFailure = (x: IPFSHashFailure) => Promise<void>

type isIPFSFailureExisting = (x: string) => Promise<boolean>

type updateNewIPFSFailure = (x: IPFSHashFailure) => Promise<void>

type updateExistingIPFSFailure = (x: IPFSHashFailure) => Promise<void>

type isNameExisting = (x: string) => Promise<boolean>

type removeIPFSFailure = (x: string) => Promise<void>

type updateEstimatedSmartFeeInfo = (x: EstimatedSmartFeeInfo) => Promise<void>

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

  readonly isNameExisting: isNameExisting = async name => {
    const existing = await this.collection.findOne({ name })
    return !!existing
  }

  readonly insertIPFSFailure: insertIPFSFailure = async ({ failureReason, failureType, ipfsFileHash, failureTime }) => {
    await this.collection.updateOne(
      { name: 'ipfsDownloadRetries' },
      {
        $set: {
          ipfsDownloadRetries: [
            { ipfsFileHash, failureReason, failureType, lastDownloadAttemptTime: failureTime, downloadAttempts: 1 },
          ],
        },
      },
      { upsert: true },
    )
  }

  readonly isIPFSFailureExisting: isIPFSFailureExisting = async ipfsFileHash => {
    const existing = await this.collection.findOne({
      name: 'ipfsDownloadRetries',
      'ipfsDownloadRetries.ipfsFileHash': ipfsFileHash,
    })
    return !!existing
  }

  readonly updateNewIPFSFailure: updateNewIPFSFailure = async (
    { ipfsFileHash, failureReason, failureType, failureTime },
  ) => {
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
      },
    )
  }

  readonly updateExistingIPFSFailure: updateExistingIPFSFailure = async (
    { ipfsFileHash, failureReason, failureType, failureTime },
  ) => {
    await this.collection.updateOne(
      { name: 'ipfsDownloadRetries', 'ipfsDownloadRetries.ipfsFileHash': ipfsFileHash },
      {
        $set: {
          'ipfsDownloadRetries.$.failureReason': failureReason,
          'ipfsDownloadRetries.$.failureType': failureType,
          'ipfsDownloadRetries.$.lastDownloadAttemptTime': failureTime,
        },
        $inc: { 'ipfsDownloadRetries.$.downloadAttempts': 1 },
      },
    )
  }

  readonly removeIPFSFailure: removeIPFSFailure = async ipfsFileHash => {
    await this.collection.updateOne(
      { name: 'ipfsDownloadRetries' },
      { $pull: { ipfsDownloadRetries: { ipfsFileHash } } },
    )
  }
}

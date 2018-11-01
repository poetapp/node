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

export interface IPFSInfo {
  readonly ipfsIsConnected: boolean
}

type updateBlockchainInfo = (x: BlockchainInfo) => Promise<UpdateWriteOpResult>

type updateWalletInfo = (x: WalletInfo) => Promise<UpdateWriteOpResult>

type updateNetworkInfo = (x: NetworkInfo) => Promise<UpdateWriteOpResult>

type updateIPFSInfo = (x: IPFSInfo) => Promise<UpdateWriteOpResult>

type insertIPFSFailure = (x: IPFSHashFailure) => Promise<UpdateWriteOpResult>

type findIPFSFailure = (x: string) => Promise<WriteOpResult>

type updateNewIPFSFailure = (x: IPFSHashFailure) => Promise<UpdateWriteOpResult>

type updateExistingIPFSFailure = (x: IPFSHashFailure) => Promise<UpdateWriteOpResult>

type findByName = (x: string) => Promise<WriteOpResult>

type removeIPFSFailure = (x: string) => Promise<UpdateWriteOpResult>
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

  readonly findByName: findByName = name =>
    this.collection.findOne({name})

  readonly insertIPFSFailure: insertIPFSFailure = ({ failureReason, failureType, ipfsFileHash, failureTime }) =>
    this.collection.updateOne(
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

  readonly findIPFSFailure: findIPFSFailure = ipfsFileHash =>
    this.collection.findOne({
      name: 'ipfsDownloadRetries',
      'ipfsDownloadRetries.ipfsFileHash': ipfsFileHash,
    })

  readonly updateNewIPFSFailure: updateNewIPFSFailure = ({ ipfsFileHash, failureReason, failureType, failureTime }) =>
    this.collection.updateOne(
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

  readonly updateExistingIPFSFailure: updateExistingIPFSFailure = (
    { ipfsFileHash, failureReason, failureType, failureTime },
  ) =>
    this.collection.updateOne(
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

  readonly removeIPFSFailure: removeIPFSFailure = ipfsFileHash =>
    this.collection.updateOne(
      { name: 'ipfsDownloadRetries' },
      { $pull: { ipfsDownloadRetries: { ipfsFileHash } } },
    )
}

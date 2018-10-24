import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'
import { pick, pipeP } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'

import { IPFS } from './IPFS'

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

export interface HealthControllerConfiguration {
  readonly lowWalletBalanceInBitcoin: number
}

interface BlockchainInfo {
  readonly blocks: number
  readonly verificationprogress: number
  readonly bestblockhash: string
  readonly warnings: string
  readonly size_on_disk: number
}

interface WalletInfo {
  readonly balance: number
  readonly txcount: number
  readonly balanceLow?: boolean
}

interface NetworkInfo {
  readonly version: number
  readonly subversion: string
  readonly connections: number
  readonly networkactive: boolean
  readonly protocolversion: number
  readonly warnings: string
}

interface IPFSInfo {
  readonly ipfsIsConnected: boolean
}

const blockchainInfoKeys = ['blocks', 'verificationprogress', 'bestblockhash', 'warnings', 'size_on_disk']

const walletInfoKeys = ['balance', 'txcount']

const networkInfoKeys = ['version', 'subversion', 'connections', 'networkactive', 'protocolversion', 'warnings']

export const isStatus200 = ({ status }: { status: number }) => status === 200
const pickNetworkInfoKeys = pick(networkInfoKeys)
const pickBlockchainInfoKeys = pick(blockchainInfoKeys)
const pickWalletInfoKeys = pick(walletInfoKeys)

export const addWalletIsBalanceLow = (lowBalanceAmount: number) => (walletInfo: WalletInfo) => {
  const { balance } = walletInfo
  return balance < lowBalanceAmount ? { ...walletInfo, isBalanceLow: true } : { ...walletInfo, isBalanceLow: false }
}

@injectable()
export class HealthController {
  private readonly configuration: HealthControllerConfiguration
  private readonly db: Db
  private readonly collection: Collection
  private readonly bitcoinCore: BitcoinCore
  private readonly logger: Pino.Logger
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('HealthControllerConfiguration') configuration: HealthControllerConfiguration,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.configuration = configuration
    this.db = db
    this.collection = this.db.collection('health')
    this.bitcoinCore = bitcoinCore
    this.ipfs = ipfs
  }

  private readonly log = (level: LogTypes) => (message: string) => async (value: any) => {
    const logger = this.logger
    logger[level]({ value }, message)
    return value
  }

  private async getBlockchainInfo(): Promise<BlockchainInfo> {
    return pickBlockchainInfoKeys(await this.bitcoinCore.getBlockchainInfo())
  }

  private async updateBlockchainInfo(blockchainInfo: BlockchainInfo): Promise<BlockchainInfo> {
    await this.collection.updateOne(
      { name: 'blockchainInfo' },
      {
        $set: {
          blockchainInfo,
        },
      },
      { upsert: true }
    )
    return blockchainInfo
  }

  private async getWalletInfo(): Promise<WalletInfo> {
    return pickWalletInfoKeys(await this.bitcoinCore.getWalletInfo())
  }

  private addWalletIsBalanceLow(walletInfo: WalletInfo): WalletInfo {
    return addWalletIsBalanceLow(this.configuration.lowWalletBalanceInBitcoin)(walletInfo)
  }

  private async updateWalletInfo(walletInfo: WalletInfo): Promise<WalletInfo> {
    await this.collection.updateOne(
      { name: 'walletInfo' },
      {
        $set: {
          walletInfo,
        },
      },
      { upsert: true }
    )
    return walletInfo
  }

  private async getNetworkInfo(): Promise<NetworkInfo> {
    return pickNetworkInfoKeys(await this.bitcoinCore.getNetworkInfo())
  }

  private async updateNetworkInfo(networkInfo: NetworkInfo): Promise<NetworkInfo> {
    await this.collection.updateOne(
      { name: 'networkInfo' },
      {
        $set: {
          networkInfo,
        },
      },
      { upsert: true }
    )
    return networkInfo
  }

  private async checkIPFSConnection(): Promise<IPFSInfo> {
    try {
      const ipfsConnection = await this.ipfs.getVersion()
      const ipfsIsConnected = isStatus200(ipfsConnection)
      return { ipfsIsConnected }
    } catch (e) {
      return { ipfsIsConnected: false }
    }
  }

  private async updateIPFSInfo(ipfsInfo: IPFSInfo): Promise<object> {
    await this.collection.updateOne(
      { name: 'ipfsInfo' },
      {
        $set: {
          ipfsInfo,
        },
      },
      { upsert: true }
    )
    return ipfsInfo
  }

  public refreshBlockchainInfo = pipeP(
    this.log(LogTypes.trace)('refreshing blockchain info'),
    this.getBlockchainInfo,
    this.log(LogTypes.trace)('new info gathered, saving blockchain info'),
    this.updateBlockchainInfo,
    this.log(LogTypes.trace)('refreshed blockchain info')
  )

  public refreshWalletInfo = pipeP(
    this.log(LogTypes.trace)('refreshing wallet info'),
    this.getWalletInfo,
    this.log(LogTypes.trace)('checking wallet balance against alert threshold'),
    this.addWalletIsBalanceLow,
    this.log(LogTypes.trace)('new info gathered, saving wallet info'),
    this.updateWalletInfo,
    this.log(LogTypes.trace)('refreshed wallet info')
  )

  public refreshNetworkInfo = pipeP(
    this.log(LogTypes.trace)('refreshing network info'),
    this.getNetworkInfo,
    this.log(LogTypes.trace)('new info gathered, saving network info'),
    this.updateNetworkInfo,
    this.log(LogTypes.trace)('refreshed network info')
  )

  public refreshIPFSInfo = pipeP(
    this.log(LogTypes.trace)('refreshing IPFS info'),
    this.checkIPFSConnection,
    this.log(LogTypes.trace)('new info gathered, saving IPFS info'),
    this.updateIPFSInfo,
    this.log(LogTypes.trace)('refreshed IPFS info')
  )
}

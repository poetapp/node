import BitcoinCore = require('bitcoin-core')
import * as Pino from 'pino'
import { pick, pipeP } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { IPFSHashFailure, ClaimIPFSHashPair } from 'Interfaces'

import { BlockchainInfo, WalletInfo, NetworkInfo, IPFSInfo, EstimatedSmartFeeInfo, HealthDAO } from './HealthDAO'

import { IPFS } from './IPFS'

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

export interface HealthControllerConfiguration {
  readonly lowWalletBalanceInBitcoin: number
  readonly feeEstimateMinTargetBlock: number
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

export const isFailureHard = (failureType: string) => failureType === 'HARD'

export interface Dependencies {
  readonly healthDAO: HealthDAO
  readonly bitcoinCore: BitcoinCore
  readonly logger: Pino.Logger
  readonly ipfs: IPFS
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: HealthControllerConfiguration
}

export class HealthController {
  private readonly configuration: HealthControllerConfiguration
  private readonly healthDAO: HealthDAO
  private readonly bitcoinCore: BitcoinCore
  private readonly logger: Pino.Logger
  private readonly ipfs: IPFS

  constructor({
    dependencies: {
      logger,
      healthDAO,
      bitcoinCore,
      ipfs,
    },
    configuration,
  }: Arguments) {
    this.logger = childWithFileName(logger, __filename)
    this.configuration = configuration
    this.healthDAO = healthDAO
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
    await this.healthDAO.updateBlockchainInfo(blockchainInfo)
    return blockchainInfo
  }

  private async getWalletInfo(): Promise<WalletInfo> {
    return pickWalletInfoKeys(await this.bitcoinCore.getWalletInfo())
  }

  private addWalletIsBalanceLow(walletInfo: WalletInfo): WalletInfo {
    return addWalletIsBalanceLow(this.configuration.lowWalletBalanceInBitcoin)(walletInfo)
  }

  private async updateWalletInfo(walletInfo: WalletInfo): Promise<WalletInfo> {
    await this.healthDAO.updateWalletInfo(walletInfo)
    return walletInfo
  }

  private async getNetworkInfo(): Promise<NetworkInfo> {
    return pickNetworkInfoKeys(await this.bitcoinCore.getNetworkInfo())
  }

  private async updateNetworkInfo(networkInfo: NetworkInfo): Promise<NetworkInfo> {
    await this.healthDAO.updateNetworkInfo(networkInfo)
    return networkInfo
  }

  private async getEstimatedSmartFee(): Promise<EstimatedSmartFeeInfo> {
    return this.bitcoinCore.estimateSmartFee(this.configuration.feeEstimateMinTargetBlock)
  }

  private async updateEstimatedSmartFee(estimatedSmartFeeInfo: EstimatedSmartFeeInfo): Promise<EstimatedSmartFeeInfo> {
    await this.healthDAO.updateEstimatedSmartFeeInfo(estimatedSmartFeeInfo)
    return estimatedSmartFeeInfo
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
    await this.healthDAO.updateIPFSInfo(ipfsInfo)
    return ipfsInfo
  }

  public async updateIPFSFailures(ipfsHashFailures: ReadonlyArray<IPFSHashFailure>) {
    this.logger.debug({ ipfsHashFailures }, 'Updating IPFS Failure Count by failureType')
    await ipfsHashFailures.map(
      async ({ failureType }) => {
        if (isFailureHard(failureType)) await this.healthDAO.increaseHardIPFSFailure()
        else await this.healthDAO.increaseSoftIPFSFailure()
      },
    )
  }

  public refreshBlockchainInfo = pipeP(
    this.log(LogTypes.trace)('refreshing blockchain info'),
    this.getBlockchainInfo,
    this.log(LogTypes.trace)('new info gathered, saving blockchain info'),
    this.updateBlockchainInfo,
    this.log(LogTypes.trace)('refreshed blockchain info'),
  )

  public refreshEstimatedSmartFee = pipeP(
    this.log(LogTypes.trace)('refreshing transaction fee info'),
    this.getEstimatedSmartFee,
    this.log(LogTypes.trace)('new info gathered, saving transaction fee info'),
    this.updateEstimatedSmartFee,
    this.log(LogTypes.trace)('refreshed transaction fee info'),
  )

  public refreshWalletInfo = pipeP(
    this.log(LogTypes.trace)('refreshing wallet info'),
    this.getWalletInfo,
    this.log(LogTypes.trace)('checking wallet balance against alert threshold'),
    this.addWalletIsBalanceLow,
    this.log(LogTypes.trace)('new info gathered, saving wallet info'),
    this.updateWalletInfo,
    this.log(LogTypes.trace)('refreshed wallet info'),
  )

  public refreshNetworkInfo = pipeP(
    this.log(LogTypes.trace)('refreshing network info'),
    this.getNetworkInfo,
    this.log(LogTypes.trace)('new info gathered, saving network info'),
    this.updateNetworkInfo,
    this.log(LogTypes.trace)('refreshed network info'),
  )

  public refreshIPFSInfo = pipeP(
    this.log(LogTypes.trace)('refreshing IPFS info'),
    this.checkIPFSConnection,
    this.log(LogTypes.trace)('new info gathered, saving IPFS info'),
    this.updateIPFSInfo,
    this.log(LogTypes.trace)('refreshed IPFS info'),
  )
}

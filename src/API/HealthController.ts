import { Db, Collection } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { TransactionAnchorRetryInfo } from 'Interfaces'

export const isOkOne = ({ ok }: { ok: number }) => ok === 1

export interface HealthObject {
  readonly mongoIsConnected: boolean
  readonly ipfsInfo: object
  readonly walletInfo: object
  readonly blockchainInfo: object
  readonly networkInfo: object
  readonly estimatedSmartFeeInfo: object
  readonly ipfsRetryInfo: object
  readonly transactionAnchorRetryInfo: TransactionAnchorRetryInfo
}

export interface Dependencies {
  readonly db: Db
  readonly logger: Pino.Logger
}

export interface Arguments {
  readonly dependencies: Dependencies
}

interface EmptyTransactionAnchorRetryInfo {
  transactionAnchorRetryInfo: TransactionAnchorRetryInfo
}

const emptyTransactionAnchorRetryInfo: EmptyTransactionAnchorRetryInfo = {
  transactionAnchorRetryInfo: [],
}

export interface HealthController {
  readonly getHealth: () => Promise<HealthObject>
}

export const HealthController = ({
  dependencies: {
    db,
    logger,
  },
}: Arguments): HealthController => {
  const collection = db.collection('health')
  const healthControllerLogger = childWithFileName(logger, __dirname)

  const checkMongo = async (): Promise<boolean> => {
    try {
      const mongoConnection = await db.stats()
      return isOkOne(mongoConnection)
    } catch (e) {
      return false
    }
  }

  const getIPFSInfo = async (): Promise<object> => {
    try {
      const { ipfsInfo = {} } = await collection.findOne({ name: 'ipfsInfo' })
      return ipfsInfo
    } catch (e) {
      return { error: 'Error retrieving IPFSInfo...' }
    }
  }

  const getBlockchainInfo = async (): Promise<object> => {
    try {
      const { blockchainInfo = {} } = await collection.findOne({ name: 'blockchainInfo' })
      return blockchainInfo
    } catch (e) {
      return { error: 'Error retrieving blockchainInfo...' }
    }
  }

  const getWalletInfo = async (): Promise<object> => {
    try {
      const { walletInfo = {} } = await collection.findOne({ name: 'walletInfo' })
      return walletInfo
    } catch (e) {
      return { error: 'Error retrieving walletInfo...' }
    }
  }

  const getNetworkInfo = async (): Promise<object> => {
    try {
      const { networkInfo = {} } = await collection.findOne({ name: 'networkInfo' })
      return networkInfo
    } catch (e) {
      return { error: 'Error retrieving networkInfo...' }
    }
  }

  const getEstimatedSmartFeeInfo = async (): Promise<object> => {
    try {
      const { estimatedSmartFeeInfo = {} } = await collection.findOne({ name: 'estimatedSmartFeeInfo' })
      return estimatedSmartFeeInfo
    } catch (e) {
      return { error: 'Error retrieving estimatedSmartFeeInfo...' }
    }
  }

  const getIPFSRetryInfo = async (): Promise<object> => {
    try {
      const {
        hardFailures = 0,
        softFailures = 0,
      } = await collection.findOne({ name: 'ipfsDownloadRetries' }) || {}
      const ipfsRetryInfo = { hardFailures, softFailures }
      return ipfsRetryInfo
    } catch (e) {
      return { error: 'Error retrieving ipfsRetryInfo...' }
    }
  }

  const getTransactionRetryInfo = async (): Promise<TransactionAnchorRetryInfo> => {
    const logger = healthControllerLogger.child({ method: 'getTransactionRetryInfo' })
    logger.trace('retrieving TransactionAnchorRetryInfo')
    try {
      const transactionAnchorRetryResults = await collection.findOne(
        {
          name: 'transactionAnchorRetryInfo',
        },
        {
          fields:
            {
              _id: false,
              name: false,
            },
        },
      ) || emptyTransactionAnchorRetryInfo
      logger.trace({ transactionAnchorRetryResults }, 'getTransactionRetryInfo results')
      return transactionAnchorRetryResults.transactionAnchorRetryInfo
    } catch (error) {
      logger.error({ error }, 'error retrieving TransactionAnchorRetryInfo')
      return []
    }
  }

  const getHealth = async (): Promise<HealthObject> => {
    const mongoIsConnected = await checkMongo()
    const ipfsInfo = await getIPFSInfo()
    const walletInfo = await getWalletInfo()
    const blockchainInfo = await getBlockchainInfo()
    const networkInfo = await getNetworkInfo()
    const estimatedSmartFeeInfo = await getEstimatedSmartFeeInfo()
    const ipfsRetryInfo = await getIPFSRetryInfo()
    const transactionAnchorRetryInfo = await getTransactionRetryInfo()
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

  return {
    getHealth,
  }
}

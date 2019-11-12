import Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'
import { BlockDownloaded } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { Business } from './Business'
import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly business: Business
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export interface Router {
  readonly start: () => Promise<void>
}

export const Router = ({
  dependencies: {
    logger,
    messaging,
    business,
  },
  exchange,
}: Arguments): Router => {
  const routerLogger = childWithFileName(logger, __filename)

  const start = async () => {
    await messaging.consume(exchange.claimIpfsHash, onClaimIPFSHash)
    await messaging.consume(exchange.batchCreated, onBatchCreated)
    await messaging.consumeBlockDownloaded(onPoetBlockAnchorsDownloaded)
    await messaging.consumeClaimsDownloaded(onClaimsDownloaded)
    await messaging.consume(exchange.batchRead, onBatchRead)
  }

  const onClaimIPFSHash = async (message: any) => {
    const logger = routerLogger.child({ method: 'onClaimIPFSHash' })

    const messageContent = message.content.toString()
    const { claimId, ipfsFileHash } = JSON.parse(messageContent)

    logger.trace({ claimId, ipfsFileHash }, 'Storing an IPFS File Hash + Claim Id')

    try {
      await business.insertClaimIdFilePair(claimId, ipfsFileHash)
    } catch (error) {
      logger.error({ error, claimId, ipfsFileHash })
    }
  }

  const onBatchCreated = async (message: any): Promise<void> => {
    const logger = routerLogger.child({ method: 'onBatchCreated' })

    const messageContent = message.content.toString()
    const { ipfsFileHashes, ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace({ ipfsDirectoryHash, ipfsFileHashes }, 'Setting IPFS Directory Hashes')

    try {
      await business.setBatchDirectory(ipfsFileHashes, ipfsDirectoryHash)
    } catch (error) {
      logger.error({ error, ipfsDirectoryHash, ipfsFileHashes })
    }
  }

  const onPoetBlockAnchorsDownloaded = async (blockDownloaded: BlockDownloaded) => {
    const logger = routerLogger.child({ method: 'onPoetBlockAnchorsDownloaded' })

    const { poetBlockAnchors } = blockDownloaded

    logger.trace({ poetBlockAnchors }, 'Downloaded Po.et Anchor')

    try {
      await business.setAnchors(poetBlockAnchors)
    } catch (error) {
      logger.error({ error, poetBlockAnchors })
    }
  }

  const onBatchRead = async (message: any) => {
    const logger = routerLogger.child({ method: 'onBatchRead' })

    const messageContent = message.content.toString()
    const { ipfsFileHashes, ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace({ ipfsDirectoryHash, ipfsFileHashes }, 'Batch Read')

    try {
      await business.confirmBatchDirectory(ipfsFileHashes, ipfsDirectoryHash)
    } catch (error) {
      logger.error({ error, ipfsFileHashes, ipfsDirectoryHash })
    }
  }

  const onClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = routerLogger.child({ method: 'onClaimsDownloaded' })

    logger.trace({ claimIPFSHashPairs }, 'Downloaded (IPFS Hash, Claim) pairs')

    try {
      await business.confirmClaimFiles(claimIPFSHashPairs)
    } catch (error) {
      logger.error({ error, claimIPFSHashPairs })
    }
  }

  return {
    start,
  }
}

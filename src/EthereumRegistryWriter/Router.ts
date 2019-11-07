import * as Pino from 'pino'

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
    await messaging.consume(exchange.ipfsDirectoryCreated, onIPFSDirectoryCreated)
    await messaging.consumeBlockDownloaded(onPoetBlockAnchorsDownloaded)
    await messaging.consumeClaimsDownloaded(onClaimsDownloaded)
    await messaging.consume(exchange.ipfsDirectoryRead, onIPFSDirectoryRead)
  }

  const onClaimIPFSHash = async (message: any) => {
    const logger = routerLogger.child({ method: 'onClaimIPFSHash' })

    const messageContent = message.content.toString()
    const { claimId, ipfsFileHash } = JSON.parse(messageContent)

    logger.info({ claimId, ipfsFileHash }, 'Storing an IPFS File Hash + Claim Id')

    try {
      await business.insertClaimIdIPFSFileHashPair(claimId, ipfsFileHash)
    } catch (error) {
      logger.error({ error }, 'Failed to set claimId and ipfsFileHash on works')
    }
  }

  const onIPFSDirectoryCreated = async (message: any): Promise<void> => {
    const logger = routerLogger.child({
      method: 'onIPFSDirectoryCreated',
    })

    const messageContent = message.content.toString()
    const { ipfsFileHashes, ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace(
      {
        ipfsDirectoryHash,
        ipfsFileHashes,
      },
      'Setting IPFS Directory Hashes',
    )

    try {
      await business.setDirectoryHash({
        ipfsFileHashes,
        ipfsDirectoryHash,
      })
    } catch (error) {
      logger.error(
        {
          ipfsDirectoryHash,
          ipfsFileHashes,
          error,
        },
        'Error setting IPFS Directory Hashes',
      )
    }
  }

  const onPoetBlockAnchorsDownloaded = async (blockDownloaded: BlockDownloaded) => {
    const logger = routerLogger.child({ method: 'onPoetBlockAnchorsDownloaded' })

    const { poetBlockAnchors } = blockDownloaded

    logger.trace({ poetBlockAnchors }, 'Downloaded Po.et Anchor')
    try {
      await business.setAnchors(poetBlockAnchors)
    } catch (error) {
      logger.error({ error }, 'Failed to upsert poetBlockAnchors on works')
    }
  }

  const onIPFSDirectoryRead = async (message: any) => {
    const logger = routerLogger.child({
      method: 'onIPFSDirectoryRead',
    })

    const messageContent = message.content.toString()
    const { ipfsFileHashes, ipfsDirectoryHash } = JSON.parse(messageContent)
    logger.info({ ipfsDirectoryHash, ipfsFileHashes }, 'Verifying IPFS directory hashes against file hashes...')
    try {
      await business.confirmBatchDirectory({
        ipfsFileHashes,
        ipfsDirectoryHash,
      })
    } catch (error) {
      logger.error({ error, ipfsFileHashes, ipfsDirectoryHash })
    }
  }

  const onClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = routerLogger.child({ method: 'onClaimsDownloaded' })

    logger.trace({ claimIPFSHashPairs }, 'Downloaded (IPFS Hash, Claim) pairs')
    try {
      await business.verifyIPFSFileHashes(claimIPFSHashPairs)
    } catch (error) {
      logger.error({ error })
    }
  }

  return {
    start,
  }
}

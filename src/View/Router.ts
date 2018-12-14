import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'
import { BlockDownloaded } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { WorkController } from './WorkController'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly workController: WorkController
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export interface Router {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Router = ({
  dependencies: {
    logger,
    messaging,
    workController,
  },
  exchange,
}: Arguments): Router => {
  const routerLogger = childWithFileName(logger, __filename)

  const start = async () => {
    await messaging.consume(exchange.newClaim, onNewClaim)
    await messaging.consume(exchange.claimIpfsHash, onClaimIPFSHash)
    await messaging.consume(exchange.ipfsHashTxId, onIPFSHashTxId)
    await messaging.consumeBlockDownloaded(onPoetBlockAnchorsDownloaded)
    await messaging.consumeClaimsDownloaded(onClaimsDownloaded)
    await messaging.consume(
      exchange.batchReaderReadNextDirectorySuccess,
      onBatchReaderReadNextDirectorySuccess,
    )
    await messaging.consume(
      exchange.batchWriterCreateNextBatchSuccess,
      onBatchWriterCreateNextBatchSuccess,
    )
  }

  const stop = async () => {
    routerLogger.info('Stopping View Router...')
    routerLogger.info('Stopping View Messaging...')
    await messaging.stop()
  }

  const onNewClaim = async (message: any) => {
    const logger = routerLogger.child({ method: 'onNewClaim' })

    const messageContent = message.content.toString()
    logger.trace({ messageContent }, 'Setting message content on works')

    try {
      await workController.createWork(JSON.parse(messageContent))
    } catch (error) {
      logger.error({ error }, 'Failed to create on works')
    }
  }

  const onClaimIPFSHash = async (message: any) => {
    const logger = routerLogger.child({ method: 'onClaimIPFSHash' })

    const messageContent = message.content.toString()
    const { claimId, ipfsFileHash } = JSON.parse(messageContent)

    logger.info({ claimId, ipfsFileHash }, 'Setting IPFSHash on works')

    try {
      await workController.setIPFSHash(claimId, ipfsFileHash)
    } catch (error) {
      logger.error({ error }, 'Failed to set claimId and ipfsFileHash on works')
    }
  }

  const onBatchWriterCreateNextBatchSuccess = async (message: any): Promise<void> => {
    const logger = routerLogger.child({
      method: 'onBatchWriterCreateNextBatchSuccess',
    })

    const messageContent = message.content.toString()
    const { ipfsFileHashes, ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace(
      {
        ipfsDirectoryHash,
        ipfsFileHashes,
      },
      'Adding IPFS Directory Hash to claims',
    )

    try {
      await workController.setDirectoryHashOnEntries({
        ipfsDirectoryHash,
        ipfsFileHashes,
      })
      logger.trace({ ipfsDirectoryHash, ipfsFileHashes }, 'IPFS Directory Hash set successfully')
    } catch (error) {
      logger.error(
        {
          ipfsDirectoryHash,
          ipfsFileHashes,
          error,
        },
        'Error setting IPFS Directory Hash',
      )
    }
  }

  const onIPFSHashTxId = async (message: any) => {
    const logger = routerLogger.child({ method: 'onIPFSHashTxId' })

    const messageContent = message.content.toString()
    const { ipfsDirectoryHash, txId } = JSON.parse(messageContent)

    logger.trace({ ipfsDirectoryHash, txId }, 'Setting TransactionID for IPFS Directory Hash')

    try {
      await workController.setTxId(ipfsDirectoryHash, txId)
    } catch (error) {
      logger.error({ error }, 'Failed to set txId on works')
    }
  }

  const onPoetBlockAnchorsDownloaded = async (blockDownloaded: BlockDownloaded) => {
    const logger = routerLogger.child({ method: 'onPoetBlockAnchorsDownloaded' })

    const { poetBlockAnchors } = blockDownloaded

    logger.trace({ poetBlockAnchors }, 'Downloaded Po.et Anchor')
    try {
      await workController.upsertAnchors(poetBlockAnchors)
    } catch (error) {
      logger.error({ error }, 'Failed to upsert poetBlockAnchors on works')
    }
  }

  const onBatchReaderReadNextDirectorySuccess = async (message: any) => {
    const logger = routerLogger.child({
      method: 'onBatchReaderReadNextDirectorySuccess',
    })

    const messageContent = message.content.toString()
    const { ipfsFileHashes, ipfsDirectoryHash } = JSON.parse(messageContent)
    logger.info({ ipfsDirectoryHash, ipfsFileHashes }, 'Setting ipfsDirectoryHash on works')
    try {
      await workController.setFileHashesForDirectoryHash({
        ipfsFileHashes,
        ipfsDirectoryHash,
      })
    } catch (error) {
      logger.error({ error, ipfsFileHashes, ipfsDirectoryHash }, 'Failed to set ipfsDirectoryHash on works')
    }
  }

  const onClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = routerLogger.child({ method: 'onClaimsDownloaded' })

    logger.trace({ claimIPFSHashPairs }, 'Downloaded a (IPFS Hash, Claim Id) Pair')
    try {
      await workController.upsertClaimIPFSHashPair(claimIPFSHashPairs)
    } catch (error) {
      logger.error({ error }, 'Failed to upsert claimIPFSHashPairs on works')
    }
  }

  return {
    start,
    stop,
  }
}

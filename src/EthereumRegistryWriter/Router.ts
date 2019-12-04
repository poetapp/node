import { Server } from 'http'
import Koa from 'koa'
import KoaRouter from 'koa-router'
import Pino from 'pino'
import { promisify } from 'util'

import { EthereumRegistryContract } from 'Helpers/EthereumRegistryContract'
import { childWithFileName } from 'Helpers/Logging'
import { ClaimIPFSHashPair } from 'Interfaces'
import { BlockDownloaded } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { Business } from './Business'
import { ExchangeConfiguration } from './ExchangeConfiguration'

export interface Configuration {
  readonly apiPort: number
  readonly exchange: ExchangeConfiguration
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly business: Business
  readonly ethereumRegistryContract: EthereumRegistryContract
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: Configuration
}

export interface Router {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Router = ({
  dependencies: {
    logger,
    messaging,
    business,
    ethereumRegistryContract,
  },
  configuration: {
    apiPort,
    exchange,
  },
}: Arguments): Router => {
  const routerLogger = childWithFileName(logger, __filename)
  const koa = new Koa()
  const koaRouter = new KoaRouter()
  let server: Server

  const start = async () => {
    await messaging.consume(exchange.claimIpfsHash, onClaimIPFSHash)
    await messaging.consume(exchange.batchCreated, onBatchCreated)
    await messaging.consumeBlockDownloaded(onPoetBlockAnchorsDownloaded)
    await messaging.consumeClaimsDownloaded(onClaimsDownloaded)
    await messaging.consume(exchange.batchRead, onBatchRead)

    const handleEventError = (error: any, event: any) => {
      if (error)
        logger.error({ error, event })
    }

    const onCidAddedPromievent = await ethereumRegistryContract.onCidAdded({}, handleEventError)

    onCidAddedPromievent
      .on('connected', (subscriptionId: string) => {
        logger.info({ subscriptionId }, 'onCidAdded connected')
      })
      .on('data', onCidAdded)
      .on('changed', (event: any) => {
        logger.warn({ event }, 'onCidAdded changed')
      })
      .on('error', (error: any) => {
        logger.error({ error }, 'onCidAdded error')
      })

    server = koa.listen(apiPort, '0.0.0.0')
  }

  const stop = async () => {
    routerLogger.debug('Stopping API Router...')
    server.unref()
    await promisify(server.close.bind(server))
    routerLogger.info('API Router stopped')
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

  const onCidAdded = async (event: any) => {
    const logger = routerLogger.child({ method: 'onCidAdded' })

    logger.trace({ event }, 'onCidAdded')

    try {
      await business.setRegistryIndex(
        event.returnValues.cid,
        event.returnValues.index,
        event.transactionHash,
        event.blockHash,
        event.blockNumber,
      )
    } catch (error) {
      logger.error({ error, event })
    }
  }

  const getHealth = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    context.body = await business.getHealth()
  }

  koaRouter.get('/health', getHealth)
  koa.use(koaRouter.allowedMethods())
  koa.use(koaRouter.routes())

  return {
    start,
    stop,
  }
}

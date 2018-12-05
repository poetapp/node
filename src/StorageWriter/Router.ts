import { isSignedVerifiableClaim } from '@po.et/poet-js'
import * as Pino from 'pino'
import { anyPass } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { isNoMoreEntriesException } from './Exceptions'
import { ExchangeConfiguration } from './ExchangeConfiguration'

export const isTraceError = anyPass([isNoMoreEntriesException])

export interface Router {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly messaging: Messaging
  readonly claimController: ClaimController
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export const Router = ({
  dependencies: {
    logger,
    messaging,
    claimController,
  },
  exchange,
}: Arguments): Router => {
  const childLogger = childWithFileName(logger, __filename)

  const onNewClaim = async (message: any): Promise<void> => {
    const methodLogger = childLogger.child({ method: 'onNewClaim' })

    const messageContent = message.content.toString()

    const claim = JSON.parse(messageContent)

    if (!isSignedVerifiableClaim(claim))
      methodLogger.error(`Received a ${exchange.newClaim} message, but the content isn't a claim.`)

    try {
      await claimController.create(claim)
    } catch (error) {
      methodLogger.error(
        {
          error,
        },
        'Uncaught Exception while Storing Claim',
      )
    }
  }

  const onStorageWriterStoreNextClaim = async () => {
    const methodLogger = childLogger.child({ method: 'onStorageWriterStoreNextClaim' })
    methodLogger.trace('Upload next claim request')

    try {
      const { ipfsFileHash, claim } = await claimController.storeNextClaim()
      await messaging.publish(exchange.claimIpfsHash, {
        claimId: claim.id,
        ipfsFileHash,
      })
      methodLogger.info({ ipfsFileHash, claim }, 'Upload next claim success')
    } catch (error) {
      if (isTraceError(error)) return methodLogger.trace({ error })
      methodLogger.error({ error }, 'Upload next claim failure')
    }
  }

  const start = async () => {
    await messaging.consume(exchange.newClaim, onNewClaim)
    await messaging.consume(exchange.storageWriterStoreNextClaim, onStorageWriterStoreNextClaim)
  }

  const stop = async () => {
    childLogger.info('Stopping StorageWriter Router...')
    await messaging.stop()
  }

  return {
    start,
    stop,
  }
}

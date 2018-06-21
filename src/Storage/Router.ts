import { isClaim, PoetTimestamp } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { ClaimController } from './ClaimController'
import { DirectoryCollection } from './DirectoryCollection'
import { IPFS } from './IPFS'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: ClaimController
  private readonly directoryCollection: DirectoryCollection
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('ClaimController') claimController: ClaimController,
    @inject('DirectoryCollection') directoryCollection: DirectoryCollection,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
    this.directoryCollection = directoryCollection
    this.ipfs = ipfs
  }

  async start() {
    await this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
    await this.messaging.consumePoetTimestampsDownloaded(this.onPoetTimestampsDownloaded)
    await this.messaging.consume(Exchange.StorageAddFilesToDirectoryRequest, this.onStorageAddFilesToDirectoryRequest)
    await this.messaging.consume(Exchange.BatcherGetHashesSuccess, this.onBatcherGetHashesSuccess)
    await this.messaging.consume(
      Exchange.StorageGetFilesHashesFromNextDirectoryRequest,
      this.onStorageGetFilesHashesFromNextDirectoryRequest
    )
  }

  onNewClaim = async (message: any): Promise<void> => {
    const messageContent = message.content.toString()

    const claim = JSON.parse(messageContent)

    if (!isClaim(claim)) throw new Error(`Received a ${Exchange.NewClaim} message, but the content isn't a claim.`)

    try {
      await this.claimController.create(claim)
    } catch (error) {
      this.logger.error(
        {
          method: 'onNewClaim',
          error,
        },
        'Uncaught Exception while Storing Claim'
      )
    }
  }

  onPoetTimestampsDownloaded = async (poetTimestamps: ReadonlyArray<PoetTimestamp>): Promise<void> => {
    const logger = this.logger.child({ method: 'onPoetTimestampsDownloaded' })
    logger.trace(
      {
        poetTimestamps,
      },
      'Downloading Claims from IPFS'
    )
    try {
      await this.directoryCollection.addItems(poetTimestamps.map(_ => _.ipfsHash))
    } catch (error) {
      logger.error({ error, poetTimestamps }, 'Failed to add directory hash to DB collection')
    }
  }

  onBatcherGetHashesSuccess = async (message: any) => {
    const messageContent = message.content.toString()
    const { fileHashes } = JSON.parse(messageContent)
    if (fileHashes.length > 0) this.messaging.publish(Exchange.StorageAddFilesToDirectoryRequest, { fileHashes })
  }

  onStorageAddFilesToDirectoryRequest = async (message: any) => {
    const logger = this.logger.child({ method: 'onStorageAddFilesToDirectoryRequest' })
    const messageContent = message.content.toString()
    const { fileHashes } = JSON.parse(messageContent)
    logger.trace('Adding files hashes to directory', { fileHashes })
    try {
      const emptyDirectoryHash = await this.ipfs.createEmptyDirectory()
      const directoryHash = await this.ipfs.addFilesToDirectory({ directoryHash: emptyDirectoryHash, fileHashes })
      this.messaging.publish(Exchange.StorageAddFilesToDirectorySuccess, { fileHashes, directoryHash })
      logger.trace('Succesfully added file hashes to directory', { fileHashes, directoryHash })
    } catch (error) {
      logger.error(
        {
          error,
        },
        'Failed to add file hashes to a directory'
      )
      this.messaging.publish(Exchange.StorageAddFilesToDirectoryFailure, {
        error,
        fileHashes,
      })
    }
  }

  onStorageGetFilesHashesFromNextDirectoryRequest = async (message: any) => {
    const logger = this.logger.child({ method: 'onStorageGetFilesHashesFromNextDirectoryRequest' })
    logger.trace('Downloading IPFS claim hashes from IPFS Directory hash')
    try {
      const collectionItem = await this.directoryCollection.findItem()
      if (!collectionItem) return
      const { hash: directoryHash } = collectionItem
      await this.directoryCollection.incAttempts({ hash: directoryHash })
      const fileHashes = await this.ipfs.getDirectoryFileHashes(directoryHash)
      await this.claimController.download(fileHashes)
      await this.directoryCollection.setSuccessTime({ hash: directoryHash })
      this.messaging.publish(Exchange.StorageGetFilesHashesFromNextDirectorySuccess, { directoryHash, fileHashes })
    } catch (error) {
      logger.error({ error }, 'Error downloading IPFS claim hashes from IPFS Directory hash')
      this.messaging.publish(Exchange.StorageGetFilesHashesFromNextDirectoryFailure, { error })
    }
  }
}

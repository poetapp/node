import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { FileCollection } from './FileCollection'
import { IPFS } from './IPFS'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly fileHashCollection: FileCollection
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('FileCollection') fileHashCollection: FileCollection,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.fileHashCollection = fileHashCollection
    this.ipfs = ipfs
  }

  async start() {
    await this.messaging.consume(Exchange.ClaimIPFSHash, this.onClaimIPFSHash)
    await this.messaging.consume(Exchange.BatchWriterCreateNextBatchRequest, this.onBatchWriterCreateNextBatchRequest)
    await this.messaging.consume(Exchange.BlockchainWriterTimestampSuccess, this.onBlockchainWriterTimestampSuccess)
    await this.messaging.consume(Exchange.BatchWriterCompleteHashesRequest, this.onBatchWriterCompleteHashesRequest)
  }

  onClaimIPFSHash = async (message: any): Promise<void> => {
    const messageContent = message.content.toString()
    const item = JSON.parse(messageContent)

    try {
      await this.fileHashCollection.addEntry({ ipfsHash: item.ipfsHash })
    } catch (error) {
      this.logger.error(
        {
          method: 'onClaimIPFSHash',
          error,
        },
        'Uncaught Exception while adding item to be batched'
      )
    }
  }

  onBatchWriterCreateNextBatchRequest = async () => {
    const logger = this.logger.child({ method: 'onBatchWriterCreateNextBatchRequest' })
    logger.trace('Create next batch request')
    try {
      const { fileHashes, directoryHash } = await this.createNextBatch()
      logger.trace({ fileHashes, directoryHash }, 'Create next batch success')
      await this.messaging.publish(Exchange.BatchWriterCreateNextBatchSuccess, { fileHashes, directoryHash })
    } catch (error) {
      logger.error({ error }, 'Create next batch failure')
      await this.messaging.publish(Exchange.BatchWriterCreateNextBatchFailure, {
        error,
      })
    }
  }

  // This method should live in a controller, not a router
  createNextBatch = async (): Promise<{ fileHashes: ReadonlyArray<string>; directoryHash: string }> => {
    const items = await this.fileHashCollection.findNextEntries()
    const fileHashes = items.map(({ ipfsHash }) => ipfsHash)
    const emptyDirectoryHash = await this.ipfs.createEmptyDirectory()
    const directoryHash = await this.ipfs.addFilesToDirectory({ directoryHash: emptyDirectoryHash, fileHashes })
    return { fileHashes, directoryHash }
  }

  // Q: what advantage does this method give us? it simple re-publishes a message, but with a different name
  onBlockchainWriterTimestampSuccess = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBatchWriterCompleteHashesRequest' })
    const messageContent = message.content.toString()
    const { fileHashes, directoryHash } = JSON.parse(messageContent)
    try {
      await this.messaging.publish(Exchange.BatchWriterCompleteHashesRequest, { fileHashes, directoryHash })
    } catch (error) {
      logger.error({ fileHashes, directoryHash }, 'Failed to publish BatchWriterCompleteHashesRequest')
    }
  }

  // A: onBlockchainWriterTimestampSuccess is a routing method, onBatchWriterCompleteHashesRequest is a saga
  // routing and sagas must be kept apart.
  // can't use RMQ for in-module communication. use something in-memory, same as redux-saga.
  // otherwise won't scale.
  onBatchWriterCompleteHashesRequest = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBatchWriterCompleteHashesRequest' })
    const messageContent = message.content.toString()
    const { fileHashes, directoryHash } = JSON.parse(messageContent)
    logger.trace({ fileHashes, directoryHash }, 'Mark hashes complete request')
    try {
      await this.completeHashes({ fileHashes, directoryHash })
      await this.fileHashCollection.setEntrySuccessTimes(fileHashes.map((ipfsHash: string) => ({ ipfsHash })))
      logger.trace({ fileHashes, directoryHash }, 'Mark hashes complete success')
    } catch (error) {
      logger.error({ error, fileHashes, directoryHash }, 'Mark hashes complete failure')
    }
  }

  // We don't really need a separate method for this
  // It's perfectly fine to call and await something from a saga
  private completeHashes = async ({
    fileHashes,
    directoryHash,
  }: {
    fileHashes: ReadonlyArray<string>
    directoryHash: string
  }): Promise<void> => {
    try {
      await this.fileHashCollection.setEntrySuccessTimes(fileHashes.map((ipfsHash: string) => ({ ipfsHash })))
      await this.messaging.publish(Exchange.BatchWriterCompleteHashesSuccess, { fileHashes, directoryHash })
    } catch (error) {
      await this.messaging.publish(Exchange.BatchWriterCompleteHashesFailure, { error, fileHashes, directoryHash })
    }
  }
}

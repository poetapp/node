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

  onBatchWriterCreateNextBatchRequest = async (message: any) => {
    const logger = this.logger.child({ method: 'onBatchWriterCreateNextBatchRequest' })

    logger.trace('Batch file hashes request')
    try {
      const items = await this.fileHashCollection.findNextEntries()
      const fileHashes = items.map(x => x.ipfsHash)
      const emptyDirectoryHash = await this.ipfs.createEmptyDirectory()
      const directoryHash = await this.ipfs.addFilesToDirectory({ directoryHash: emptyDirectoryHash, fileHashes })
      this.messaging.publish(Exchange.BatchWriterCreateNextBatchSuccess, { fileHashes, directoryHash })
      logger.trace('Batch file hashes success', { fileHashes, directoryHash })
    } catch (error) {
      logger.error(
        {
          error,
        },
        'Batch file hashes failure'
      )
      this.messaging.publish(Exchange.BatchWriterCreateNextBatchFailure, {
        error,
      })
    }
  }

  onBlockchainWriterTimestampSuccess = (message: any): void => {
    const messageContent = message.content.toString()
    const { fileHashes, directoryHash } = JSON.parse(messageContent)
    this.messaging.publish(Exchange.BatchWriterCompleteHashesRequest, { fileHashes, directoryHash })
  }

  onBatchWriterCompleteHashesRequest = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onBatchWriterCompleteHashesRequest' })
    const messageContent = message.content.toString()
    const { fileHashes, directoryHash } = JSON.parse(messageContent)
    logger.trace('Marking hashes as complete', { fileHashes, directoryHash })
    try {
      await this.fileHashCollection.setEntrySuccessTimes(fileHashes.map((ipfsHash: string) => ({ ipfsHash })))
      this.messaging.publish(Exchange.BatchWriterCompleteHashesSuccess, { fileHashes, directoryHash })
      logger.trace('Successfully mark hashes as complete', { fileHashes, directoryHash })
    } catch (error) {
      logger.error({ error }, 'Failed to mark hashes as complete', { fileHashes, directoryHash })
      this.messaging.publish(Exchange.BatchWriterCompleteHashesFailure, { error, fileHashes, directoryHash })
    }
  }
}

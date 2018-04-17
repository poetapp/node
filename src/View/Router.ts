import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { ClaimIPFSHashPair, PoetTimestamp } from 'poet-js'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { WorkController } from './WorkController'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly workController: WorkController

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('WorkController') workController: WorkController
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.workController = workController
  }

  async start() {
    await this.messaging.consume(Exchange.NewClaim, this.onNewClaim)
    await this.messaging.consume(Exchange.ClaimIPFSHash, this.onClaimIPFSHash)
    await this.messaging.consume(Exchange.IPFSHashTxId, this.onIPFSHashTxId)
    await this.messaging.consumePoetTimestampsDownloaded(this.onPoetTimestampsDownloaded)
    await this.messaging.consumeClaimsDownloaded(this.onClaimsDownloaded)
  }

  onNewClaim = (message: any) => {
    const messageContent = message.content.toString()

    this.workController.createWork(JSON.parse(messageContent))
  }

  onClaimIPFSHash = (message: any) => {
    const messageContent = message.content.toString()
    const { claimId, ipfsHash } = JSON.parse(messageContent)

    this.workController.setIPFSHash(claimId, ipfsHash)
  }

  onIPFSHashTxId = (message: any) => {
    const messageContent = message.content.toString()
    const { ipfsHash, txId } = JSON.parse(messageContent)

    this.workController.setTxId(ipfsHash, txId)
  }

  onPoetTimestampsDownloaded = async (poetTimestamps: ReadonlyArray<PoetTimestamp>) => {
    const logger = this.logger.child({ method: 'onPoetTimestampsDownloaded' })

    logger.trace({ poetTimestamps }, 'Downloaded Po.et Timestamp')

    await this.workController.upsertTimestamps(poetTimestamps)
  }

  onClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    const logger = this.logger.child({ method: 'onClaimsDownloaded' })

    logger.trace({ claimIPFSHashPairs }, 'Downloaded a (IPFS Hash, Claim Id) Pair')

    await this.workController.upsertClaimIPFSHashPair(claimIPFSHashPairs)
  }
}

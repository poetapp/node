import { Claim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS } from './IPFS'

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly ipfs: IPFS
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('IPFS') ipfs: IPFS,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('storageWriter')
    this.messaging = messaging
    this.ipfs = ipfs
    this.exchange = exchange
  }

  async create(claim: Claim): Promise<void> {
    const logger = this.logger.child({ method: 'create' })

    logger.trace({ claim }, 'Storing Claim')

    const ipfsFileHash = await this.ipfs.addText(JSON.stringify(claim))

    logger.info({ claim, ipfsFileHash }, 'Claim Stored')

    await this.collection.insertOne({
      claimId: claim.id,
      ipfsFileHash,
    })
    await this.messaging.publish(this.exchange.claimIpfsHash, {
      claimId: claim.id,
      ipfsFileHash,
    })
  }
}

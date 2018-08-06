import { Work } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

interface WorksFilters {
  readonly publicKey?: string
  readonly offset?: number
  readonly limit?: number
}

@injectable()
export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging

  constructor(@inject('Logger') logger: Pino.Logger, @inject('DB') db: Db, @inject('Messaging') messaging: Messaging) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('works')
    this.messaging = messaging
  }

  async getById(id: string): Promise<any> {
    this.logger.trace({ method: 'getById', id }, 'Getting Work by Id from DB')
    return this.collection.findOne({ id }, { projection: { _id: false } })
  }

  async getByFilters(worksFilters: WorksFilters = {}): Promise<ReadonlyArray<any>> {
    this.logger.trace({ method: 'getByFilters', worksFilters }, 'Getting Work by Filters from DB')
    const { offset, limit, ...filters } = worksFilters
    return this.collection
      .find(filters, { projection: { _id: false } })
      .sort({
        _id: -1,
      })
      .skip(offset)
      .limit(limit || 10)
      .toArray()
  }

  async create(work: Work): Promise<void> {
    this.logger.trace({ method: 'create', work }, 'Creating Work')
    // TODO: verify id, publicKey, signature and createdDate
    await this.messaging.publish(Exchange.NewClaim, work)
  }
}

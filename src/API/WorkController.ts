import { Work, PoetBlockAnchor } from '@po.et/poet-js'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

interface WorksFilters {
  readonly issuer?: string
  readonly offset?: number
  readonly limit?: number
}

interface WorkWithAnchor extends Work {
  readonly anchor: PoetBlockAnchor
}

interface WorksWithCount {
  readonly count: number
  readonly works: ReadonlyArray<WorkWithAnchor>
}

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
  readonly messaging: Messaging
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly exchange: ExchangeConfiguration
}

export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly exchange: ExchangeConfiguration

  constructor({
    dependencies: {
      logger,
      db,
      messaging,
    },
    exchange,
  }: Arguments) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('works')
    this.messaging = messaging
    this.exchange = exchange
  }

  async getById(id: string): Promise<any> {
    this.logger.trace({ method: 'getById', id }, 'Getting Work by Id from DB')
    return this.collection.findOne({ id }, { projection: { _id: false } })
  }

  async getByFilters(worksFilters: WorksFilters = {}): Promise<WorksWithCount> {
    this.logger.trace({ method: 'getByFilters', worksFilters }, 'Getting Work by Filters from DB')
    const { offset, limit, ...filters } = worksFilters
    const works = await this.collection
      .find(filters, { projection: { _id: false } })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit || 10)
      .toArray()
    const count = await this.collection.find(filters, { projection: { _id: false } }).count()
    return { count, works }
  }

  async getWorksCountByFilters(worksFilters: WorksFilters = {}): Promise<number> {
    this.logger.trace({ method: 'getWorksCountByFilters', worksFilters }, 'Getting Work Counts by Filters from DB')
    const count = await this.collection.find(worksFilters, { projection: { _id: false } }).count()
    return count
  }

  async create(work: Work): Promise<void> {
    this.logger.trace({ method: 'create', work }, 'Creating Work')
    // TODO: verify id, publicKey, signature and createdDate
    await this.messaging.publish(this.exchange.newClaim, work)
  }
}

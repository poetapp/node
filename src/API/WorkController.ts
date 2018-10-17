import { IllegalArgumentException, PoetBlockAnchor, SignedVerifiableClaim, VerifiableClaimSigner } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'

interface WorksFilters {
  readonly issuer?: string
  readonly publicKey?: string
  readonly offset?: number
  readonly limit?: number
}

interface WorkWithAnchor extends SignedVerifiableClaim {
  readonly timestamp: PoetBlockAnchor
}

interface WorksWithCount {
  readonly count: number
  readonly works: ReadonlyArray<WorkWithAnchor>
}

@injectable()
export class WorkController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly exchange: ExchangeConfiguration
  private readonly verifiableClaimSigner: VerifiableClaimSigner

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration,
    @inject('VerifiableClaimSigner') verifiableClaimSigner: VerifiableClaimSigner
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('works')
    this.messaging = messaging
    this.exchange = exchange
    this.verifiableClaimSigner = verifiableClaimSigner
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

  async create(work: SignedVerifiableClaim): Promise<void> {
    this.logger.trace({ method: 'create', work }, 'Creating Work')
    if (!(await this.verifiableClaimSigner.isValidSignedVerifiableClaim(work)))
      throw new IllegalArgumentException('Invalid Work Claim')
    await this.messaging.publish(this.exchange.newClaim, work)
  }
}

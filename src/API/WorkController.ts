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

export interface WorkController {
  readonly getById: (id: string) => Promise<any>
  readonly getByFilters: (worksFilters: WorksFilters) => Promise<WorksWithCount>
  readonly getWorksCountByFilters: (worksFilters: WorksFilters) => Promise<number>
  readonly create: (work: Work) => Promise<void>
}

export const WorkController = ({
  dependencies: {
    logger,
    db,
    messaging,
  },
  exchange,
}: Arguments) => {
  const workControllerLogger = childWithFileName(logger, __filename)
  const collection = db.collection('works')

  const getById = (id: string): Promise<any> => {
    workControllerLogger.trace({ method: 'getById', id }, 'Getting Work by Id from DB')
    return collection.findOne({ id }, { projection: { _id: false } })
  }

  const getByFilters = async (worksFilters: WorksFilters = {}): Promise<WorksWithCount> => {
    workControllerLogger.trace({ method: 'getByFilters', worksFilters }, 'Getting Work by Filters from DB')
    const { offset, limit, ...filters } = worksFilters
    const works = await collection
      .find(filters, { projection: { _id: false } })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit || 10)
      .toArray()
    const count = await collection.find(filters, { projection: { _id: false } }).count()
    return { count, works }
  }

  const getWorksCountByFilters = async (worksFilters: WorksFilters = {}): Promise<number> => {
    workControllerLogger.trace({
      method: 'getWorksCountByFilters',
      worksFilters,
    }, 'Getting Work Counts by Filters from DB')
    const count = await collection.find(worksFilters, { projection: { _id: false } }).count()
    return count
  }

  const create = async (work: Work): Promise<void> => {
    workControllerLogger.trace({ method: 'create', work }, 'Creating Work')
    // TODO: verify id, publicKey, signature and createdDate
    await messaging.publish(exchange.newClaim, work)
  }

  return {
    getById,
    getByFilters,
    getWorksCountByFilters,
    create,
  }
}

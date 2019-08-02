import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly db: Db
}

export interface Arguments {
  readonly dependencies: Dependencies
}

interface Edge {
  readonly origin: string
  readonly target: string
}

export interface GraphController {
  readonly getByUri: (uri: string) => Promise<ReadonlyArray<Edge>>
}

export const GraphController = ({
  dependencies: {
    logger: parentLogger,
    db,
  },
}: Arguments): GraphController => {
  const logger = childWithFileName(parentLogger, __filename)
  const collection: Collection = db.collection('graph')

  const getByUri = (uri: string): Promise<ReadonlyArray<Edge>> => {
    logger.trace({ method: 'getById', uri }, 'Getting graph edges')
    return collection.find({ $or: [ { uri }, { about: uri } ] }, { projection: { _id: false } }).toArray()
  }

  return {
    getByUri,
  }
}

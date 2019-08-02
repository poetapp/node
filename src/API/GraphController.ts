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

  const findEdges = (uris: ReadonlyArray<string>) => collection.find(
    {
      $or: [
        { origin: { $in: uris } },
        { target: { $in: uris } },
      ]
    },
    { projection: { _id: false },
    }).toArray()

  const getByUri = async (uri: string): Promise<ReadonlyArray<Edge>> => {
    logger.trace({ method: 'getById', uri }, 'Getting graph edges')

    const edgesToUris = (edges: ReadonlyArray<Edge>): ReadonlyArray<string> =>
      edges
        .map(({ origin, target }) => [origin, target])
        .reduce((a, c) => [...a, ...c], []) // TODO: Array.flatMap

    const recursive = async (
      searchUris: ReadonlyArray<string>,
      searchedUris: ReadonlyArray<string>,
      foundEdges: ReadonlyArray<Edge>,
    ): Promise<ReadonlyArray<Edge>> => {
      if (searchUris.length === 0)
        return foundEdges
      logger.trace({ searchUris, searchedUris, foundEdges }, 'recursive iteration')
      const newFoundEdges = await findEdges(searchUris)
      const newSearchUris = edgesToUris(newFoundEdges).filter(uri => !searchedUris.includes(uri))
      logger.trace({ newFoundEdges, newSearchUris }, 'edgesToUris')
      return recursive(newSearchUris, [...searchedUris, ...searchUris], [...foundEdges, ...newFoundEdges])
    }

    return recursive([uri], [], [])
  }

  return {
    getByUri,
  }
}

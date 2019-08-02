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

    const edgesMatch = (a: Edge) => (b: Edge) => a.origin === b.origin && a.target === b.target

    const recursive = async (
      searchUris: ReadonlyArray<string> | string,
      searchedUris: ReadonlyArray<string> = [],
      foundEdges: ReadonlyArray<Edge> = [],
    ): Promise<ReadonlyArray<Edge>> => {
      if (typeof searchUris === 'string')
        return recursive([searchUris])
      if (searchUris.length === 0)
        return foundEdges
      const newFoundEdges = await findEdges(searchUris)
      const deduplicatedNewFoundEdges = newFoundEdges.filter(edge => !foundEdges.some(edgesMatch(edge)))
      const newSearchUris = edgesToUris(deduplicatedNewFoundEdges)
        .filter(uri => !searchUris.includes(uri))
        .filter(uri => !searchedUris.includes(uri))
      const deduplicatedNewSearchUris = searchUris.filter(uri => !searchedUris.includes(uri))
      return recursive(
        newSearchUris,
        [...searchedUris, ...deduplicatedNewSearchUris],
        [...foundEdges, ...deduplicatedNewFoundEdges],
      )
    }

    return recursive(uri)
  }

  return {
    getByUri,
  }
}

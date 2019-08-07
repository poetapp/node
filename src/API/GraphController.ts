import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { GraphDAO } from './GraphDAO'

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly graphDao: GraphDAO
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
    graphDao,
  },
}: Arguments): GraphController => {
  const logger = childWithFileName(parentLogger, __filename)

  const getByUri = async (uri: string): Promise<ReadonlyArray<Edge>> => {
    const methodLogger = logger.child({ method: 'getById', uri })
    methodLogger.trace('Getting graph edges')

    const edgesToUris = (edges: ReadonlyArray<Edge>): ReadonlyArray<string> =>
      edges
        .map(({ origin, target }) => [origin, target])
        .reduce((a, c) => [...a, ...c], []) // TODO: Array.flatMap

    const edgesMatch = (a: Edge) => (b: Edge) => a.origin === b.origin && a.target === b.target

    const recursive = async (
      searchUris: ReadonlyArray<string> | string,
      searchedUris: ReadonlyArray<string> = [],
      foundEdges: ReadonlyArray<Edge> = [],
      stackDepth: number = 1,
    ): Promise<{ edges: ReadonlyArray<Edge>, stackDepth: number }> => {
      if (typeof searchUris === 'string')
        return recursive([searchUris])
      if (searchUris.length === 0)
        return { edges: foundEdges, stackDepth }
      const newFoundEdges = await graphDao.findEdges(searchUris)
      const deduplicatedNewFoundEdges = newFoundEdges.filter(edge => !foundEdges.some(edgesMatch(edge)))
      const newSearchUris = edgesToUris(deduplicatedNewFoundEdges)
        .filter(uri => !searchUris.includes(uri))
        .filter(uri => !searchedUris.includes(uri))
      const deduplicatedNewSearchUris = searchUris.filter(uri => !searchedUris.includes(uri))
      return recursive(
        newSearchUris,
        [...searchedUris, ...deduplicatedNewSearchUris],
        [...foundEdges, ...deduplicatedNewFoundEdges],
        stackDepth + 1,
      )
    }

    const { edges, stackDepth } = await recursive(uri)

    methodLogger.info({ uri, stackDepth })

    return edges
  }

  return {
    getByUri,
  }
}

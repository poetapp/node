import { Collection } from 'mongodb'

export interface Entry {
  readonly origin: string
  readonly target: string
}

export interface Dependencies {
  readonly collection: Collection
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export interface GraphDAO {
  readonly findEdges: (uris: ReadonlyArray<string>) => Promise<ReadonlyArray<Entry>>
}

export const GraphDAO = ({
  dependencies: {
    collection,
  },
}: Arguments): GraphDAO => {
  const findEdges = (uris: ReadonlyArray<string>) => collection.find(
    {
      $or: [
        { origin: { $in: uris } },
        { target: { $in: uris } },
      ],
    },
    { projection: { _id: false },
    }).toArray()

  return {
    findEdges,
  }
}

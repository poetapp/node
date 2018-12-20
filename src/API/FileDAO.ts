import { Collection } from 'mongodb'

export interface Entry {
  hash: string
}

export const Symbols = {
  Collection: Symbol.for('Collection'),
  FileDAO: Symbol.for('FileDAO'),
}

export interface Dependencies {
  readonly collection: Collection
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export interface FileDAO {
  readonly addEntry: (entry: Entry) => Promise<void>
}

export const FileDAO = ({
  dependencies: {
    collection,
  },
}: Arguments): FileDAO => {
  const addEntry = async (entry: Entry) => {
    await collection.insertOne(entry)
  }

  return {
    addEntry,
  }
}

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

export class FileDAO {
  private readonly collection: Collection

  constructor({
    dependencies: {
      collection,
    },
  }: Arguments) {
    this.collection = collection
  }

  public addEntry = async (entry: Entry) => {
    await this.collection.insertOne(entry)
  }
}

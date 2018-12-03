import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface Entry {
  hash: string
}

export const Symbols = {
  Collection: Symbol.for('Collection'),
  FileDAO: Symbol.for('FileDAO'),
}

@injectable()
export class FileDAO {
  private readonly collection: Collection

  constructor(
    @inject(Symbols.Collection) collection: Collection,
  ) {
    this.collection = collection
  }

  public addEntry = async (entry: Entry) => {
    await this.collection.insertOne(entry)
  }
}

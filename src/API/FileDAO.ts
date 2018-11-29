import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface Entry {
  hash: string
}

@injectable()
export class FileDAO {
  private readonly collection: Collection

  constructor(
    @inject('Collection') collection: Collection,
  ) {
    this.collection = collection
  }

  public addEntry = async (entry: Entry) => {
    await this.collection.insertOne(entry)
  }
}

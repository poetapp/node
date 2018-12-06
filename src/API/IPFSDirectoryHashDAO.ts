import { AnchorRetryDAOResult, getAnchorRetryHealth } from 'Interfaces'
import { Collection } from 'mongodb'
import { isNil } from 'ramda'

export interface Entry {
  hash: string
}

export interface Dependencies {
  readonly collection: Collection
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class IPFSDirectoryHashDAO {
  private readonly collection: Collection

  constructor({
    dependencies: {
      collection,
    },
  }: Arguments) {
    this.collection = collection
  }

  readonly getAnchorRetryHealth: getAnchorRetryHealth = async () => {
    const cursorArray = await this.collection.aggregate([
      { $match: { attempts: { $ne: 1 } } },
      { $group: { _id: '$attempts', count: { $sum: 1} } },
    ]).toArray()

    if (isNil(cursorArray) || cursorArray.length === 0) return []

    return cursorArray.map( (item: AnchorRetryDAOResult) => ({ attempts: item._id, count: item.count }))
  }
}

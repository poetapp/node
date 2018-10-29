import { PoetBlockAnchor } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface Entry {
  readonly _id?: string
  readonly blockHeight: number
  readonly blockHash: string
  readonly previousBlockHash: string
  readonly matchingAnchors: ReadonlyArray<PoetBlockAnchor>
  readonly unmatchingAnchors: ReadonlyArray<PoetBlockAnchor>
}

type upsertEntryByHeight = (entry: Entry) => Promise<any>

type findHighestBlockHeight = () => Promise<number | undefined>

type findHashByHeight = (blockHeight: number) => Promise<string | undefined>

@injectable()
export class DAO {
  private readonly collection: Collection

  constructor(@inject('Collection') collection: Collection) {
    this.collection = collection
  }

  readonly start = async (): Promise<void> => {
    await this.collection.createIndex({ blockHeight: 1 }, { unique: true })
    await this.collection.createIndex({ blockHash: 1 }, { unique: true })
  }

  readonly upsertEntryByHash: upsertEntryByHeight = (entry: Entry) => {
    const { blockHash, ...restOfEntry } = entry
    return this.collection.updateOne(
      { blockHash },
      {
        $set: {
          ...restOfEntry,
        },
      },
      { upsert: true },
    )
  }

  readonly findHighestBlockHeight: findHighestBlockHeight = async () => {
    const [{ blockHeight = null } = {}] = await this.collection
      .find({}, { projection: { blockHeight: true, _id: 0 } })
      .sort({ blockHeight: -1 })
      .limit(1)
      .toArray()
    return blockHeight
  }

  readonly findHashByHeight: findHashByHeight = async (blockHeight: number) => {
    const [{ blockHash = null } = {}] = await this.collection
      .find({ blockHeight }, { projection: { blockHash: true, _id: 0 } })
      .limit(1)
      .toArray()
    return blockHash
  }
}

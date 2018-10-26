import { PoetBlockAnchor } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface Entry {
  readonly _id?: string
  readonly blockHeight: number
  readonly blockHash: string
  readonly matchingAnchors: ReadonlyArray<PoetBlockAnchor>
  readonly unmatchingAnchors: ReadonlyArray<PoetBlockAnchor>
}

type upsertEntryByHeight = (entry: Entry) => Promise<any>

type findHighestBlockHeight = () => Promise<number | undefined>

@injectable()
export class DAO {
  private readonly collection: Collection

  constructor(@inject('Collection') collection: Collection) {
    this.collection = collection
  }

  readonly start = async (): Promise<void> => {
    await this.collection.createIndex({ blockHeight: 1 }, { unique: true })
  }

  readonly upsertEntryByHeight: upsertEntryByHeight = ({
    blockHeight,
    blockHash,
    matchingAnchors,
    unmatchingAnchors,
  }) =>
    this.collection.updateOne(
      { blockHeight },
      {
        $set: {
          blockHash,
          matchingAnchors,
          unmatchingAnchors,
        },
      },
      { upsert: true }
    )

  readonly findHighestBlockHeight: findHighestBlockHeight = async () => {
    const [{ blockHeight = null } = {}] = await this.collection
      .find({}, { projection: { blockHeight: true, _id: 0 } })
      .sort({ blockHeight: -1 })
      .limit(1)
      .toArray()
    return blockHeight
  }
}

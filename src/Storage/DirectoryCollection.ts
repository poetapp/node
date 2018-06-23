import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

import { minutesToMiliseconds } from 'Helpers/Time'

export interface Entry {
  _id?: string
  attempts?: number
  ipfsHash: string
  lastAttemptTime?: number
  successTime?: string
}

type init = () => Promise<void>

type addEntries = (entries: ReadonlyArray<{ ipfsHash: string }>) => Promise<any>

type findIncompleteEntry = (
  options?: {
    currentTime?: number
    retryDelay?: number
    maxAttempts?: number
  }
) => Promise<Entry>

type setSuccessTime = (x: { ipfsHash: string; successTime?: number }) => Promise<any>

type incAttempts = (x: { ipfsHash: string; lastAttemptTime?: number }) => Promise<any>

@injectable()
export class DirectoryCollection {
  private readonly collection: Collection

  constructor(@inject('collection') collection: Collection) {
    this.collection = collection
  }

  init: init = async () => {
    await this.collection.createIndex({ ipfsHash: 1 }, { unique: true })
  }

  addEntries: addEntries = (entries = []) =>
    this.collection.insertMany(
      entries.map((entry: Entry) => ({
        ipfsHash: entry.ipfsHash,
        lastAttemptTime: null,
        successTime: null,
        attempts: 0,
      })),
      { ordered: false }
    )

  findIncompleteEntry: findIncompleteEntry = ({
    currentTime = new Date().getTime(),
    retryDelay = minutesToMiliseconds(20),
    maxAttempts = 20,
  } = {}) =>
    this.collection.findOne({
      ipfsHash: { $exists: true },
      $and: [
        {
          $or: [
            { lastAttemptTime: null },
            { lastAttemptTime: { $exists: false } },
            { lastAttemptTime: { $lt: currentTime - retryDelay } },
          ],
        },
        {
          $or: [{ successTime: null }, { successTime: { $exists: false } }],
        },
        {
          $or: [{ attempts: null }, { attempts: { $exists: false } }, { attempts: { $lte: maxAttempts } }],
        },
      ],
    })

  setSuccessTime: setSuccessTime = ({ ipfsHash, successTime = new Date().getTime() }) =>
    this.collection.updateOne(
      { ipfsHash },
      {
        $set: { successTime },
      }
    )

  incAttempts: incAttempts = ({ ipfsHash, lastAttemptTime = new Date().getTime() }) =>
    this.collection.updateOne(
      { ipfsHash },
      {
        $set: { lastAttemptTime },
        $inc: { attempts: 1 },
      }
    )
}

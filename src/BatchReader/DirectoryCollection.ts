import { inject, injectable } from 'inversify'
import { Collection, InsertWriteOpResult } from 'mongodb'

import { ErrorCodes } from 'Helpers/MongoDB'
import { minutesToMiliseconds } from 'Helpers/Time'

export interface Entry {
  _id?: string
  attempts?: number
  ipfsHash: string
  lastAttemptTime?: number
  successTime?: string
}

type start = () => Promise<void>

type addEntries = (xs: ReadonlyArray<{ ipfsHash: string }>) => Promise<InsertWriteOpResult>

type findNextEntry = (
  options?: {
    currentTime?: number
    retryDelay?: number
    maxAttempts?: number
  }
) => Promise<Entry>

type setEntrySuccessTime = (x: { ipfsHash: string; successTime?: number }) => Promise<any>

type incEntryAttempts = (x: { ipfsHash: string; lastAttemptTime?: number }) => Promise<any>

@injectable()
export class DirectoryCollection {
  private readonly collection: Collection

  constructor(@inject('collection') collection: Collection) {
    this.collection = collection
  }

  readonly start: start = async () => {
    await this.collection.createIndex({ ipfsHash: 1 }, { unique: true })
  }

  readonly addEntries: addEntries = async (entries = []) =>
    this.collection
      .insertMany(
        entries.map((entry: Entry) => ({
          ipfsHash: entry.ipfsHash,
          lastAttemptTime: null,
          successTime: null,
          attempts: 0,
        })),
        { ordered: false }
      )
      .ignoreError(error => error.code === ErrorCodes.DuplicateKey)

  readonly findNextEntry: findNextEntry = ({
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

  readonly setEntrySuccessTime: setEntrySuccessTime = ({ ipfsHash, successTime = new Date().getTime() }) =>
    this.collection.updateOne(
      { ipfsHash },
      {
        $set: { successTime },
      }
    )

  readonly incEntryAttempts: incEntryAttempts = ({ ipfsHash, lastAttemptTime = new Date().getTime() }) =>
    this.collection.updateOne(
      { ipfsHash },
      {
        $set: { lastAttemptTime },
        $inc: { attempts: 1 },
      }
    )
}

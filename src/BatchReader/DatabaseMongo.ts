import { inject, injectable } from 'inversify'
import { Db, MongoClient, Collection } from 'mongodb'

import { ErrorCodes } from 'Helpers/MongoDB'
import { minutesToMiliseconds } from 'Helpers/Time'

import { Database } from './Database'
import { DatabaseConfiguration } from './DatabaseConfiguration'
import { ReadEntry } from './ReadEntry'

@injectable()
export class DatabaseMongo implements Database {
  private readonly configuration: DatabaseConfiguration
  private db: Db
  private readEntries: Collection

  constructor(@inject('configuration') configuration: DatabaseConfiguration) {
    this.configuration = configuration
  }

  readonly start = async (): Promise<void> => {
    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.db = await mongoClient.db()
    this.readEntries = this.db.collection('batchReaderReadEntries')
    await this.readEntries.createIndex({ ipfsDirectoryHash: 1 }, { unique: true })
  }

  readonly readEntriesAdd: Database['readEntriesAdd'] = async (entries = []) => {
    await this.readEntries
      .insertMany(
        entries.map((entry: ReadEntry) => ({
          attempts: 0,
          ipfsDirectoryHash: entry.ipfsDirectoryHash,
          ipfsFileHashes: [],
          lastAttemptTime: null,
          successTime: null,
        })),
        { ordered: false }
      )
      .ignoreError(error => error.code === ErrorCodes.DuplicateKey)
  }

  readonly readEntryFindIncomplete: Database['readEntryFindIncomplete'] = ({
    currentTime = new Date().getTime(),
    retryDelay = minutesToMiliseconds(20),
    maxAttempts = 20,
  } = {}) =>
    this.readEntries.findOne({
      ipfsDirectoryHash: { $exists: true },
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

  readonly readEntryUpdate: Database['readEntryUpdate'] = async readEntry => {
    await this.readEntries.updateOne(
      { _id: readEntry._id },
      {
        attempts: readEntry.attempts,
        ipfsDirectoryHash: readEntry.ipfsDirectoryHash,
        ipfsFileHashes: readEntry.ipfsFileHashes,
        successTime: readEntry.successTime,
        lastAttemptTime: readEntry.lastAttemptTime,
      }
    )
  }
}

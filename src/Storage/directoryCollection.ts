import { Collection } from 'mongodb'

import { minutesToMiliseconds } from 'Helpers/Time'

interface Configuration {
  collection: Collection
}

type addItems = (hashes: ReadonlyArray<string>) => Promise<any>

type findItem = (options?: {
  currentTime?: number,
  retryDelay?: number,
  maxAttempts?: number
}) => Promise<any>

type setSuccessTime = (options: {
  hash: string,
  time?: number,
}) => Promise<any>

type incAttempts = (options: {
  hash: string,
  time?: number,
}) => Promise<any>

export interface DirectoryCollection {
  addItems: addItems,
  findItem: findItem,
  setSuccessTime: setSuccessTime,
  incAttempts: incAttempts
}

type createDirectoryCollection = (configuration: Configuration) => Promise<DirectoryCollection>

export const createDirectoryCollection: createDirectoryCollection = async ({ collection }) => {
  await collection.createIndex({ hash: 1 }, { unique: true })

  const addItems: addItems = (hashes = []) =>
    collection.insertMany(
      hashes.map(hash => ({
        hash,
        lastAttemptTime: null,
        successTime: null,
        attempts: 0,
      })),
      { ordered: false }
    )

  const findItem: findItem = ({
    currentTime = new Date().getTime(),
    retryDelay = minutesToMiliseconds(20),
    maxAttempts = 20,
  } = {}) =>
    collection.findOne({
      hash: { $exists: true },
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

  const setSuccessTime: setSuccessTime = ({ hash = '', time = new Date().getTime() }) =>
    collection.updateOne(
      { hash },
      {
        $set: { successTime: time },
      }
    )

  const incAttempts: incAttempts = ({ hash = '', time = new Date().getTime() }) =>
    collection.updateOne(
      { hash },
      {
        $set: { lastAttemptTime: time },
        $inc: { attempts: 1 },
      }
    )

  return {
    addItems,
    findItem,
    setSuccessTime,
    incAttempts,
  }
}

import { Collection, InsertOneWriteOpResult, UpdateWriteOpResult } from 'mongodb'

export interface Entry {
  _id?: string
  ipfsFileHash: string
  ipfsDirectoryHash?: string
  successTime?: number
}

type start = () => Promise<void>

type addEntry = (x: Entry) => Promise<InsertOneWriteOpResult>

type findNextEntries = () => Promise<ReadonlyArray<Entry>>

type completeEntry = (x: Entry) => Promise<UpdateWriteOpResult>

type completeEntries = (xs: ReadonlyArray<Entry>) => Promise<ReadonlyArray<UpdateWriteOpResult>>

export interface Dependencies {
  readonly fileCollection: Collection
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class FileDAO {
  private readonly fileCollection: Collection

  constructor({
    dependencies: {
      fileCollection,
    },
  }: Arguments) {
    this.fileCollection = fileCollection
  }

  start: start = async () => {
    await this.fileCollection.createIndex({ ipfsFileHash: 1 }, { unique: true })
  }

  addEntry: addEntry = ({ ipfsFileHash }) =>
    this.fileCollection.insertOne({ ipfsFileHash, successTime: null, ipfsDirectoryHash: null })

  findNextEntries: findNextEntries = () =>
    this.fileCollection.find({ successTime: null }, { fields: { _id: false, ipfsFileHash: true } }).toArray()

  completeEntry: completeEntry = ({ ipfsFileHash, successTime = new Date().getTime(), ipfsDirectoryHash }) =>
    this.fileCollection.updateOne({ ipfsFileHash }, { $set: { successTime, ipfsDirectoryHash } })

  completeEntries: completeEntries = (entries = []) =>
    Promise.all(
      entries.map(({ ipfsFileHash, successTime, ipfsDirectoryHash }) =>
        this.completeEntry({ ipfsFileHash, successTime, ipfsDirectoryHash }),
      ),
    )
}

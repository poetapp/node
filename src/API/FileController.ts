import * as FormData from 'form-data'
import * as fs from 'fs'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import fetch, {Response} from 'node-fetch'
import * as Pino from 'pino'
import { map } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { asyncPipe } from 'Helpers/asyncPipe'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

interface FileResponseJson {
  readonly Hash: string
}

interface File {
  readonly path: string
}

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

@injectable()
export class FileController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection

  constructor(@inject('Logger') logger: Pino.Logger, @inject('DB') db: Db) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('files')
  }

  private log = (logType: LogTypes) => (label: string) => <T extends any>(value?: T ): T => {
    this.logger[logType]({ value }, label)
    return value
  }

  private uploadStream = (stream: fs.ReadStream) => {
    const formData = new FormData()
    formData.append('file', stream)
    return fetch(`${IPFS_URL}/api/v0/add`, {
      method: 'post',
      body: formData,
      timeout: 1000 * 60 * 10,
    })
  }

  private getResponseJson = (x: Response) => x.json()

  private addFileToIPFS = (fileStream: fs.ReadStream) => this.uploadStream(fileStream)

  private storeIPFSHash = async (response: FileResponseJson) => {
    const { Hash: hash } = response
    await this.collection.insertOne({ hash })
    return response
  }

  private handleFile = asyncPipe(
    this.addFileToIPFS,
    this.getResponseJson,
    this.storeIPFSHash,
  )

  // using Promise.all directly in asyncPipe results in TypeError
  // "Promise.all called on non-object"
  private awaitAll = (xs: Array<Promise<any>>) => Promise.all(xs)

  public addFiles = asyncPipe(
    map(this.handleFile),
    this.awaitAll,
  )
}

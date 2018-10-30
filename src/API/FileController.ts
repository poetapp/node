import * as FormData from 'form-data'
import * as fs from 'fs'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import fetch from 'node-fetch'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { asyncPipe } from 'Helpers/asyncPipe'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

interface POSTFileResponse {
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

  private log = (logType: LogTypes) => (label: string) => <T extends any[]>(value?: T): T => {
    this.logger[logType]({ value }, label)
    return value
  }

  private uploadStream = (stream: fs.ReadStream) => {
    const formData = new FormData()
    formData.append('file', stream)
    return fetch(`${IPFS_URL}/api/v0/add`, {
      body: formData,
      timeout: 30000,
    })
  }

  private addFileToIPFS = async (file: File) => {
    const response = await this.uploadStream(fs.createReadStream(file.path))
    return await response.json()
  }

  private addFilesToIPFS = async (files: ReadonlyArray<File>) => Promise.all(files.map(this.addFileToIPFS))

  private storeIPFSHash = async (response: POSTFileResponse) => {
    const { Hash: hash } = response
    await this.collection.insertOne({ hash })
    return response
  }

  private storeIPFSHashes = async (responses: ReadonlyArray<POSTFileResponse>) => responses.map(this.storeIPFSHash)

  public addFiles = asyncPipe(
    this.log(LogTypes.trace)('Adding files to ipfs'),
    this.addFilesToIPFS,
    this.log(LogTypes.trace)('Added files and now storing their hashes'),
    this.storeIPFSHashes,
    this.log(LogTypes.trace)('Hashes stored'),
  )
}

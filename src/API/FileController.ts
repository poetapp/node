import * as FormData from 'form-data'
import * as fs from 'fs'
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import fetch, {Response} from 'node-fetch'
import * as Pino from 'pino'
import { map } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { minutesToMiliseconds  } from 'Helpers/Time'
import { asyncPipe } from 'Helpers/asyncPipe'

interface IPFSFileResponseJson {
  readonly Hash: string
}

interface FileResponseJson {
  readonly archiveUrl: string
  readonly hash: string
}

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

export interface FileControllerConfiguration {
  readonly ipfsArchiveUrlPrefix: string
  readonly ipfsUrl: string
}

export const convertJson = (archiveUrlPrefix: string) =>
  (ipfsFileResponse: IPFSFileResponseJson): FileResponseJson => ({
    hash: ipfsFileResponse.Hash,
    archiveUrl: `${archiveUrlPrefix}/${ipfsFileResponse.Hash}`,
  })

@injectable()
export class FileController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly ipfsArchiveUrlPrefix: string
  private readonly ipfsUrl: string

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('FileControllerConfiguration') configuration: FileControllerConfiguration,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.collection = this.db.collection('files')
    this.ipfsArchiveUrlPrefix = configuration.ipfsArchiveUrlPrefix
    this.ipfsUrl = configuration.ipfsUrl
  }

  private log = (logType: LogTypes) => (label: string) => async <T extends any>(value?: T ) => {
    this.logger[logType]({ value }, label)
    return value
  }

  private uploadStream = (stream: fs.ReadStream) => {
    const formData = new FormData()
    formData.append('file', stream)
    return fetch(`${this.ipfsUrl}/api/v0/add`, {
      method: 'post',
      body: formData,
      timeout: minutesToMiliseconds(10),
    })
  }

  private getResponseJson = (x: Response) => x.json()

  private addFileToIPFS = (fileStream: fs.ReadStream) => this.uploadStream(fileStream)

  private storeIPFSHash = async (response: FileResponseJson) => {
    const { hash } = response
    await this.collection.insertOne({ hash })
    return response
  }

  private convertResponse = (ipfsFileResponse: IPFSFileResponseJson): FileResponseJson =>
    convertJson(this.ipfsArchiveUrlPrefix)(ipfsFileResponse)

  private handleFile = asyncPipe(
    this.log(LogTypes.trace)('Adding file to ipfs'),
    this.addFileToIPFS,
    this.getResponseJson,
    this.convertResponse,
    this.log(LogTypes.trace)('Added file to ipfs, now saving the hash to the database'),
    this.storeIPFSHash,
    this.log(LogTypes.trace)('Saved the hash to the database'),
  )

  public addFiles = asyncPipe(
    this.log(LogTypes.trace)('Adding files'),
    map(this.handleFile),
    Promise.all.bind(Promise), // bind required else TypeError "Promise.all called on non-object"
    this.log(LogTypes.trace)('Added files'),
  )
}

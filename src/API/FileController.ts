import * as FormData from 'form-data'
import * as fs from 'fs'
import fetch, {Response} from 'node-fetch'
import * as Pino from 'pino'
import { map } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'
import { minutesToMiliseconds  } from 'Helpers/Time'
import { asyncPipe } from 'Helpers/asyncPipe'

import * as FileDAO from './FileDAO'

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

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly fileDao: FileDAO.FileDAO
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: FileControllerConfiguration
}

export interface FileController {
  readonly addFiles: (fileStreams: ReadonlyArray<fs.ReadStream>) => Promise<ReadonlyArray<{ hash: string}>>
}

export const FileController = ({
  dependencies: {
    fileDao,
    logger,
  },
  configuration: {
    ipfsUrl,
    ipfsArchiveUrlPrefix,
  },
}: Arguments) => {

  const log = (logType: LogTypes) => (label: string) => async <T extends any>(value?: T ): Promise<T> => {
    logger[logType]({ value }, label)
    return value
  }

  const uploadStream = (stream: fs.ReadStream) => {
    const formData = new FormData()
    formData.append('file', stream)
    return fetch(`${ipfsUrl}/api/v0/add`, {
      method: 'post',
      body: formData,
      timeout: minutesToMiliseconds(10),
    })
  }

  const getResponseJson = (x: Response) => x.json()

  const addFileToIPFS = (fileStream: fs.ReadStream) => uploadStream(fileStream)

  const storeIPFSHash = async (response: FileResponseJson) => {
    const { hash } = response
    await fileDao.addEntry({ hash })
    return response
  }

  const convertResponse = (ipfsFileResponse: IPFSFileResponseJson): FileResponseJson =>
    convertJson(ipfsArchiveUrlPrefix)(ipfsFileResponse)

  const handleFile = asyncPipe(
    log(LogTypes.trace)('Adding file to ipfs'),
    addFileToIPFS,
    getResponseJson,
    convertResponse,
    log(LogTypes.trace)('Added file to ipfs, now saving the hash to the database'),
    storeIPFSHash,
    log(LogTypes.trace)('Saved the hash to the database'),
  )

  const addFiles: FileController['addFiles'] = asyncPipe(
    log(LogTypes.trace)('Adding files'),
    map(handleFile),
    Promise.all.bind(Promise), // bind required else TypeError "Promise.all called on non-object"
    log(LogTypes.trace)('Added files'),
  )

  return {
    addFiles,
  }
}

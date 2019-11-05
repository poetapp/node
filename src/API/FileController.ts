import FormData from 'form-data'
import * as fs from 'fs'
import fetch, {Response} from 'node-fetch'
import * as Pino from 'pino'

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
  readonly addFiles: (fileStreams: ReadonlyArray<fs.ReadStream>) => Promise<ReadonlyArray<{ hash: string }>>
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

  const log = (logType: LogTypes) => (label: string) => <T>(v?: T ) => {
    logger[logType]({ value: v }, label)
    return v
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

  type handleFile = (stream: fs.ReadStream) => Promise<{ hash: string }>

  const handleFile: handleFile = asyncPipe(
    log(LogTypes.trace)('Adding file to ipfs'),
    addFileToIPFS,
    getResponseJson,
    convertResponse,
    log(LogTypes.trace)('Added file to ipfs, now saving the hash to the database'),
    storeIPFSHash,
    log(LogTypes.trace)('Saved the hash to the database'),
  )

  const addFiles = (fileStreams: ReadonlyArray<fs.ReadStream>) => Promise.all(fileStreams.map(handleFile))

  return {
    addFiles,
  }
}

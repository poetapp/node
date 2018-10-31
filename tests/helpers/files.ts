import * as FormData from 'form-data'
import * as fs from 'fs'
import fetch, { Response } from 'node-fetch'

const FILES_PATH = 'files'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`

const postFileStreams = (url: string) => (fileStreams: ReadonlyArray<fs.ReadStream>) => {
  const formData = new FormData()
  fileStreams.map((stream, index) => formData.append(`file-${index}`, stream))
  return fetch(url, {
    method: 'post',
    body: formData,
  })
}

export const getResponseJson = (x: Response) => x.json()

interface FileHelperConfiguration {
  readonly port: string
  readonly host?: string
}

export const FileHelper = ({ port, host }: FileHelperConfiguration) => {
  const url = `${baseUrl(port, host)}/${FILES_PATH}`

  return {
    postFileStreams: postFileStreams(url),
  }
}

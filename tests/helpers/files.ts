import FormData from 'form-data'
import * as fs from 'fs'
import fetch from 'node-fetch'
import stringToStream from 'string-to-stream'

const FILES_PATH = 'files'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`

const postFile = (url: string) => (body: any) => fetch(url, {
  method: 'post',
  body,
})

const postFileStreams = (url: string) => (fileStreams: ReadonlyArray<fs.ReadStream>) => {
  const formData = new FormData()
  fileStreams.map((stream, index) => formData.append(`file-${index}`, stream))
  return fetch(url, {
    method: 'post',
    body: formData,
  })
}

const postStringStreams = (url: string) => (xs: ReadonlyArray<string>) => {
  const formData = new FormData()
  xs.map(
    (s, index) => formData.append(
      `file-${index}`,
      stringToStream(s),
      {
        knownLength: Buffer.from(s).length,
        filename: `file-${index}`,
        contentType: 'plain/text',
      },
    ),
  )
  return fetch(url, {
    method: 'post',
    body: formData,
  })
}

interface FileHelperConfiguration {
  readonly port: string
  readonly host?: string
}

export const FileHelper = ({ port, host }: FileHelperConfiguration) => {
  const url = `${baseUrl(port, host)}/${FILES_PATH}`

  return {
    postFile: postFile(url),
    postFileStreams: postFileStreams(url),
    postStringStreams: postStringStreams(url),
  }
}

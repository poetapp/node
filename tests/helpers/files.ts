/* tslint:disable:no-relative-imports */
import { ReadStream } from 'fs'
import fetch from 'node-fetch'

const FILES_PATH = 'files'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`

type post = (url: string) => (body: any) => Promise<any>
const post: post = url => body =>
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  })

type configurePostFileStream = (port: string, host?: string) => (fileStream: ReadStream) => Promise<any>
export const configurePostFileStream: configurePostFileStream = (port, host) =>
  post(`${baseUrl(port, host)}/${FILES_PATH}`)

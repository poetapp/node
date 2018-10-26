/* tslint:disable:no-relative-imports */
import * as FormData from 'form-data'
import { ReadStream } from 'fs'
import fetch, { Response } from 'node-fetch'

const FILES_PATH = 'files'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`

type post = (url: string) => (body: any) => Promise<Response>
const post: post = url => body =>
  fetch(url, {
    method: 'POST',
    body,
  })

type getResponseJson = (response: Response) => Promise<any>
export const getResponseJson: getResponseJson = response => response.json()

type configurePostFileStream = (port: string, host?: string) => (fileStream: ReadStream) => Promise<any>
export const configurePostFileStream: configurePostFileStream = (port, host) => fileStream => {
  const formData = new FormData()
  formData.append('uploads', fileStream)
  formData.append('test', 'test')
  return post(`${baseUrl(port, host)}/${FILES_PATH}`)(formData)
}

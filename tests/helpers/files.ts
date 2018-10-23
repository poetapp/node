/* tslint:disable:no-relative-imports */
import * as FormData from 'form-data'
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

type createForm = (options?: any) => () => FormData
const createForm: createForm = options => () => new FormData(options)

type formAddFileStream = (fileStream: ReadStream) => (form: FormData) => FormData
const formAddFileStream: formAddFileStream = fileStream => form => {
  form.append('file', fileStream)
  return form
}

type configurePostFileStream = (port: string, host?: string) => (fileStream: ReadStream) => Promise<any>
export const configurePostFileStream: configurePostFileStream = (port, host) => fileStream => {
  const formData = new FormData()
  formData.append('file', fileStream)
  return post(`${baseUrl(port, host)}/${FILES_PATH}`)(formData)
}

import * as FormData from 'form-data'
import fetch from 'node-fetch'
import * as str from 'string-to-stream'
import { ReadStream } from 'fs'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

export interface IPFSConfiguration {
  readonly url?: string
}

export const createIpfs = ({ url = IPFS_URL  }: IPFSConfiguration = {}) => {
  const addStream = (stream: ReadStream) => {
    const formData = new FormData()
    formData.append('file', stream)
    return fetch(`${url}/api/v0/add`, {
      method: 'post',
      body: formData,
    })
  }
  return {
    addStream
  }
}

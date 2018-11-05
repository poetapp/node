import * as FormData from 'form-data'
import fetch, { Response } from 'node-fetch'
import { prop } from 'ramda'
import * as str from 'string-to-stream'

import { minutesToMiliseconds } from './Time'

const getHash = prop('Hash')

interface FetchOptions {
  readonly timeout?: number
}

export interface IPFSConfiguration {
  readonly url?: string
}

type addText = (config?: FetchOptions) => (text: string) => Promise<string>
type cat = (options?: FetchOptions) => (hash: string) => Promise<string>

export interface IPFS {
  addText: addText
  cat: cat
}

export const IPFS = ({
  url = 'http://localhost:5001',
}: IPFSConfiguration = {}) => {
  const paths = {
    add: `${url}/api/v0/add`,
    cat: `${url}/api/v0/cat`,
  }

  const addText: addText = ({
    timeout = minutesToMiliseconds(10),
  }: FetchOptions = {}) => async (text) => {
    const formData = new FormData()

    formData.append('file', str(text), {
      knownLength: Buffer.from(text).length,
      filename: 'file',
      contentType: 'plain/text',
    })

    const response = await fetch(paths.add, {
      method: 'post',
      body: formData,
      timeout,
    })

    const json = await response.json()

    return getHash(json)
  }

  const cat: cat = ({
    timeout = minutesToMiliseconds(10),
  }: FetchOptions = {}) => async (hash) => {
    const response = await fetch(`${paths.cat}?arg=${hash}`, {
      timeout,
    })
    return response.text()
  }

  return {
    addText,
    cat,
  }
}

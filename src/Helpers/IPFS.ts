import * as FormData from 'form-data'
import fetch, { Response } from 'node-fetch'
import { prop } from 'ramda'
import * as str from 'string-to-stream'

import { minutesToMiliseconds } from './Time'

const getHash = prop('Hash')

export interface IPFSConfiguration {
  readonly url?: string
}

interface FetchOptions {
  readonly timeout?: number
}

export const IPFS = ({
  url = 'http://localhost:5001',
}: IPFSConfiguration) => {
  const paths = {
    add: `${url}/api/v0/add`,
    cat: `${url}/api/v0/cat`,
  }

  const addText = ({
    timeout = minutesToMiliseconds(10),
  }: FetchOptions = {}) => async (text: string): Promise<string> => {
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

  const cat = ({
    timeout = minutesToMiliseconds(10),
  }: FetchOptions = {}) => async (hash: string): Promise<string> => {
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

import * as FormData from 'form-data'
import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'
import * as str from 'string-to-stream'

import { secondsToMiliseconds } from 'Helpers/Time'

import { IPFSConfiguration } from './IPFSConfiguration'

/**
 * Wrapper around IPFS' RPC
 */
@injectable()
export class IPFS {
  private readonly url: string
  private readonly downloadTimeoutInSeconds: number

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
    this.downloadTimeoutInSeconds = configuration.downloadTimeoutInSeconds
  }

  cat = async (hash: string): Promise<string> => {
    const response = await fetch(`${this.url}/api/v0/cat?arg=${hash}`, {
      timeout: secondsToMiliseconds(this.downloadTimeoutInSeconds),
    })
    return response.text()
  }

  addText = async (text: string): Promise<string> => {
    const formData = new FormData() // { maxDataSize: 20971520 }

    formData.append('file', str(text), {
      knownLength: text.length,
      filename: 'file',
      contentType: 'plain/text',
    })

    const response = await fetch(`${this.url}/api/v0/add`, {
      method: 'post',
      body: formData,
      timeout: 1000,
    })

    const json = await response.json()

    return json.Hash
  }
}

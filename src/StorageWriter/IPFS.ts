import * as FormData from 'form-data'
import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'
import * as str from 'string-to-stream'

export interface IPFSConfiguration {
  readonly ipfsUrl: string
}

/**
 * Wrapper around IPFS' RPC
 */
@injectable()
export class IPFS {
  private readonly url: string

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
  }

  addText = async (text: string): Promise<string> => {
    const formData = new FormData() // { maxDataSize: 20971520 }

    formData.append('file', str(text), {
      knownLength: Buffer.from(text).length,
      filename: 'file',
      contentType: 'plain/text',
    })

    const response = await fetch(`${this.url}/api/v0/add`, {
      method: 'post',
      body: formData,
      timeout: 30000,
    })

    const json = await response.json()

    return json.Hash
  }
}

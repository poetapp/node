import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'

import { IPFSConfiguration } from './IPFSConfiguration'

type checkHealth = () => Promise<number>

@injectable()
export class IPFS {
  private readonly url: string

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
  }
  checkHealth: checkHealth = async () => {
    const response = await fetch(`${this.url}/api/v0/version`)
    return response.status
  }
}

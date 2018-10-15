import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'

import { secondsToMiliseconds } from 'Helpers/Time'

export interface IPFSConfiguration {
  readonly ipfsUrl: string
  readonly downloadTimeoutInSeconds: number
}

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
}

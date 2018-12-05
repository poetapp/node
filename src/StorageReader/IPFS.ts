import fetch from 'node-fetch'

import { secondsToMiliseconds } from 'Helpers/Time'

export interface IPFSConfiguration {
  readonly ipfsUrl: string
  readonly downloadTimeoutInSeconds: number
}

export interface Arguments {
  readonly configuration: IPFSConfiguration
}

export class IPFS {
  private readonly url: string
  private readonly downloadTimeoutInSeconds: number

  constructor({
    configuration,
  }: Arguments) {
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

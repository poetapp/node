import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'

export interface IPFSConfiguration {
  readonly ipfsUrl: string
}

type getVersion = () => Promise<any>

@injectable()
export class IPFS {
  private readonly url: string

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
  }

  getVersion: getVersion = async () => await fetch(`${this.url}/api/v0/version`)
}

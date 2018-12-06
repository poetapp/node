import fetch from 'node-fetch'

export interface IPFSConfiguration {
  readonly ipfsUrl: string
}

type getVersion = () => Promise<any>

export interface Arguments {
  readonly configuration: IPFSConfiguration
}

export class IPFS {
  private readonly url: string

  constructor({
    configuration,
  }: Arguments) {
    this.url = configuration.ipfsUrl
  }

  getVersion: getVersion = async () => fetch(`${this.url}/api/v0/version`)
}

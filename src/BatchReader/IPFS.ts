import fetch from 'node-fetch'

import { isNotNil } from 'Helpers/isNotNil'

enum Type {
  File = 'File',
  Directory = 'Directory',
}

interface ObjectIPFS {
  Name: string
  Hash: string
  Size: number
  Type: Type
  Links?: ReadonlyArray<Link>
}

interface Link {
  Name: string
  Hash: string
  Size: number
  Type: Type
}

export interface LSResult {
  Arguments: {
    [key: string]: string,
  }
  Objects: {
    [key: string]: ObjectIPFS,
  }
}

type getDirectoryFileHashes = (s: string) => Promise<ReadonlyArray<string>>

type ls = (s: string) => Promise<LSResult>

export interface IPFSConfiguration {
  readonly ipfsUrl: string
}

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

  getDirectoryFileHashes: getDirectoryFileHashes = async (hash: string) => {
    const response = await this.ls(hash)
    const validResponse = isNotNil(response) &&
      isNotNil(response.Objects) &&
      isNotNil(response.Objects[hash]) &&
      isNotNil(response.Objects[hash].Links)
    return validResponse ? response.Objects[hash].Links.map(x => x.Hash) : []
  }

  ls: ls = async (hash: string) => {
    const response = await fetch(`${this.url}/api/v0/file/ls?arg=${hash}`)
    const json = await response.json()
    return json
  }
}

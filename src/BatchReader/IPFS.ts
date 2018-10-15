import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'

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
    [key: string]: string
  }
  Objects: {
    [key: string]: ObjectIPFS
  }
}

type getDirectoryFileHashes = (s: string) => Promise<ReadonlyArray<string>>

type ls = (s: string) => Promise<LSResult>

export interface IPFSConfiguration {
  readonly ipfsUrl: string
}

@injectable()
export class IPFS {
  private readonly url: string

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
  }

  getDirectoryFileHashes: getDirectoryFileHashes = async (hash: string) => {
    const response = await this.ls(hash)
    return response.Objects[hash].Links.map(x => x.Hash)
  }

  ls: ls = async (hash: string) => {
    const response = await fetch(`${this.url}/api/v0/file/ls?arg=${hash}`)
    const json = await response.json()
    return json
  }
}

import fetch from 'node-fetch'

type addFileToDirectory = (directoryhash: string, filehash: string) => Promise<string>

type addFilesToDirectory = (x: { ipfsDirectoryHash: string; ipfsFileHashes: ReadonlyArray<string> }) => Promise<string>

type createEmptyDirectory = () => Promise<string>

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

  addFileToDirectory: addFileToDirectory = async (ipfsDirectoryHash, fileHash) => {
    const response = await fetch(
      `${this.url}/api/v0/object/patch/add-link?arg=${ipfsDirectoryHash}&arg=${fileHash}&arg=${fileHash}`,
    )
    const json = await response.json()
    return json.Hash
  }

  addFilesToDirectory: addFilesToDirectory = ({ ipfsDirectoryHash = '', ipfsFileHashes = [] }) =>
    ipfsFileHashes.reduce(
      async (acc, cur) => this.addFileToDirectory(await acc, cur),
      Promise.resolve(ipfsDirectoryHash),
    )

  createEmptyDirectory: createEmptyDirectory = async () => {
    const response = await fetch(`${this.url}/api/v0/object/new?arg=unixfs-dir`)
    const json = await response.json()
    return json.Hash
  }
}

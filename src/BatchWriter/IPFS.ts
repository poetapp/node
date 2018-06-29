import { inject, injectable } from 'inversify'
import fetch from 'node-fetch'

import { IPFSConfiguration } from './IPFSConfiguration'

type addFileToDirectory = (directoryhash: string, filehash: string) => Promise<string>

type addFilesToDirectory = (x: { directoryHash: string; fileHashes: ReadonlyArray<string> }) => Promise<string>

type createEmptyDirectory = () => Promise<string>

@injectable()
export class IPFS {
  private readonly url: string

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
  }

  addFileToDirectory: addFileToDirectory = async (directoryHash, fileHash) => {
    const response = await fetch(
      `${this.url}/api/v0/object/patch/add-link?arg=${directoryHash}&arg=${fileHash}&arg=${fileHash}`
    )
    const json = await response.json()
    return json.Hash
  }

  addFilesToDirectory: addFilesToDirectory = ({ directoryHash = '', fileHashes = [] }) =>
    fileHashes.reduce(async (acc, cur) => await this.addFileToDirectory(await acc, cur), Promise.resolve(directoryHash))

  createEmptyDirectory: createEmptyDirectory = async () => {
    const response = await fetch(`${this.url}/api/v0/object/new?arg=unixfs-dir`)
    const json = await response.json()
    return json.Hash
  }
}

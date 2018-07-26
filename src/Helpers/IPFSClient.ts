import * as str from 'string-to-stream'
const ipfsAPI = require('ipfs-api')

interface IPFSConfiguration {
  readonly ipfsUrl: string
}

interface FetchOptions {
  readonly timeout: number
}

enum Type {
  File = 'File',
  Directory = 'Directory',
}

interface IPFSObject {
  readonly name?: string
  readonly hash: string
  readonly size?: number
  readonly type?: Type
  readonly links?: ReadonlyArray<IPFSObject>
}

type addFileToDirectory = (directoryHash: string, fileName: string, filehash: string) => Promise<IPFSObject>

type addText = (text: string, x?: FetchOptions) => Promise<IPFSObject>

type cat = (s: string, x?: FetchOptions) => Promise<Buffer>

type createEmptyDirectory = () => Promise<IPFSObject>

type ls = (s: string) => Promise<ReadonlyArray<IPFSObject>>

export class IPFS {
  private readonly api: any

  constructor(configuration: IPFSConfiguration) {
    this.api = ipfsAPI()
  }

  trace = (label: string) => (value: any) => value

  addFileToDirectory: addFileToDirectory = async (directoryHash, fileName, fileHash) => {
    const response = await this.api.object.patch.addLink(directoryHash, { name: fileName, multihash: fileHash })
    return response.toJSON()
  }

  addText: addText = async (text: string, fetchOptions): Promise<any> => {
    const response = await this.api.files.add([{ path: 'myfile.txt', content: str(text) }])
    return response[0]
  }

  cat: cat = async (hash, fetchOptions) => await this.api.cat(hash)

  createEmptyDirectory: createEmptyDirectory = async () => {
    const node = await this.api.object.new('unixfs-dir')
    const json = node.toJSON()
    return { ...json, hash: json.multihash }
  }

  ls: ls = async hash => this.api.ls(hash)
}

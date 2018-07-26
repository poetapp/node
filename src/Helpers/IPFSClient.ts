import * as FormData from 'form-data'
import fetch, { Response } from 'node-fetch'
import * as str from 'string-to-stream'
var Readable = require('readable-stream').Readable
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
  readonly Name?: string
  readonly hash: string
  readonly Size?: number
  readonly Type?: Type
  readonly Links?: ReadonlyArray<IPFSObject>
}

interface LSResult {
  Arguments: {
    [key: string]: string
  }
  Objects: {
    [key: string]: IPFSObject
  }
}

type addFileToDirectory = (directoryHash: string, fileName: string, filehash: string) => Promise<IPFSObject>

type addText = (text: string, x?: FetchOptions) => Promise<IPFSObject>

type cat = (s: string, x?: FetchOptions) => Promise<Response['buffer']>

type createEmptyDirectory = () => Promise<IPFSObject>

type getDirectoryFileHashes = (s: string) => Promise<ReadonlyArray<string>>

type ls = (s: string) => Promise<LSResult>

export class IPFS {
  private readonly url: string
  private readonly api: any

  constructor(configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
    this.api = ipfsAPI()
  }

  trace = (label:string) => (value:any) => value

  addFileToDirectory: addFileToDirectory = async (directoryHash, fileName, fileHash) => {
    const response = await fetch(
      `${this.url}/api/v0/object/patch/add-link?arg=${directoryHash}&arg=${fileName}&arg=${fileHash}`
    )
    return await response.json()
  }

  addText: addText = (text: string, fetchOptions): Promise<any> => this.api.files.add({ path: 'myfile.txt', content: str(text) })

  cat: cat = async (hash, fetchOptions) => {
    const response = await fetch(`${this.url}/api/v0/cat?arg=${hash}`, fetchOptions)
    return response.json()
  }

  createEmptyDirectory: createEmptyDirectory = async () => {
    const response = await fetch(`${this.url}/api/v0/object/new?arg=unixfs-dir`)
    return await response.json()
  }

  getDirectoryFileHashes: getDirectoryFileHashes = async hash => {
    const response = await this.ls(hash)
    return response.Objects[hash].Links.map(x => x.hash)
  }

  ls: ls = async hash => {
    const response = await fetch(`${this.url}/api/v0/file/ls?arg=${hash}`)
    return await response.json()
  }
}

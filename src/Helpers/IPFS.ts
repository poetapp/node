import FormData from 'form-data'
import fetch from 'node-fetch'
import { prop } from 'ramda'
import str from 'string-to-stream'

import { minutesToMiliseconds } from './Time'

const getHash = prop('Hash')

interface FetchOptions {
  readonly timeout?: number
}

export interface IPFSConfiguration {
  readonly url?: string
}

type addText = (config?: FetchOptions) => (text: string) => Promise<string>
type addJson = (json: any) => Promise<string>
type cat = (options?: FetchOptions) => (hash: string) => Promise<string>
type createEmptyDirectory = () => Promise<string>
type addFileToDirectory = (directoryhash: string, filehash: string) => Promise<string>
type addFilesToDirectory = (x: { ipfsDirectoryHash: string; ipfsFileHashes: ReadonlyArray<string> }) => Promise<string>
type createDirectory = (ipfsFileHashes: ReadonlyArray<string>) => Promise<string>

export interface IPFS {
  readonly addText: addText
  readonly addJson: addJson
  readonly cat: cat
  readonly createEmptyDirectory: createEmptyDirectory
  readonly addFileToDirectory: addFileToDirectory
  readonly addFilesToDirectory: addFilesToDirectory
  readonly createDirectory: createDirectory
}

export const IPFS = ({
  url = 'http://localhost:5001',
}: IPFSConfiguration = {}) => {
  const paths = {
    add: `${url}/api/v0/add`,
    cat: `${url}/api/v0/cat`,
  }

  const addText: addText = ({
    timeout = minutesToMiliseconds(10),
  }: FetchOptions = {}) => async (text) => {
    const formData = new FormData()

    formData.append('file', str(text), {
      knownLength: Buffer.from(text).length,
      filename: 'file',
      contentType: 'plain/text',
    })

    const response = await fetch(paths.add, {
      method: 'post',
      body: formData,
      timeout,
    })

    const json = await response.json()

    return getHash(json)
  }

  const addJson: addJson = json => addText()(JSON.stringify(json))

  const cat: cat = ({
    timeout = minutesToMiliseconds(10),
  }: FetchOptions = {}) => async (hash) => {
    const response = await fetch(`${paths.cat}?arg=${hash}`, {
      timeout,
    })
    return response.text()
  }

  const createEmptyDirectory: createEmptyDirectory = async () => {
    const response = await fetch(`${url}/api/v0/object/new?arg=unixfs-dir`)
    const json = await response.json()
    return json.Hash
  }

  const addFileToDirectory: addFileToDirectory = async (ipfsDirectoryHash, fileHash) => {
    const response = await fetch(
      `${url}/api/v0/object/patch/add-link?arg=${ipfsDirectoryHash}&arg=${fileHash}&arg=${fileHash}`,
    )
    const json = await response.json()

    if (json.Type === 'error')
      throw new Error(json.Message)

    return json.Hash
  }

  const addFilesToDirectory: addFilesToDirectory = ({ ipfsDirectoryHash = '', ipfsFileHashes = [] }) =>
    ipfsFileHashes.reduce(
      async (acc, cur) => addFileToDirectory(await acc, cur),
      Promise.resolve(ipfsDirectoryHash),
    )

  const createDirectory: createDirectory = async (ipfsFileHashes) => {
    const ipfsDirectoryHash = await createEmptyDirectory()
    return addFilesToDirectory({
      ipfsDirectoryHash,
      ipfsFileHashes,
    })
  }

  return {
    addText,
    addJson,
    cat,
    createEmptyDirectory,
    addFileToDirectory,
    addFilesToDirectory,
    createDirectory,
  }
}

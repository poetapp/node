import { asyncPipe } from 'Helpers/asyncPipe'
import fetch, { Response } from 'node-fetch'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

const getResponseText = (x: Response) => x.text()

const fetchFile = (url: string) => (hash: string) => fetch(`${url}/api/v0/cat?arg=${hash}`)

interface IPFSConfiguration {
  readonly url?: string
}

export const IPFS = ({ url = IPFS_URL }: IPFSConfiguration = {}) => {
  return {
    fetchFile: fetchFile(url),
    fetchFileContent: asyncPipe(fetchFile(url), getResponseText),
  }
}

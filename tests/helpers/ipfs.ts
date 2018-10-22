import fetch, { Response } from 'node-fetch'
import { pipeP } from 'ramda'

type getResponseText = (response: Response) => Promise<string>
const getResponseText: getResponseText = response => response.text()

type getFile = (ipfsUrl: string) => (hash: string) => Promise<Response>
const getFile: getFile = ipfsUrl => hash => fetch(`${ipfsUrl}/api/v0/cat?arg=${hash}`)

interface IPFSConfig {
  url: string
}

interface FetchFileConfig {
  ipfs: IPFSConfig
}

type fetchFile = (hash: string) => Promise<string>
type configureFetchFile = ({ ipfs }: FetchFileConfig) => fetchFile
export const configureFetchFile: configureFetchFile = ({ ipfs }) =>
  pipeP(
    getFile(ipfs.url),
    getResponseText
  )

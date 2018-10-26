import { asyncPipe } from 'Helpers/async-pipe'
import fetch, { Response } from 'node-fetch'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

type getResponseText = (response: Response) => Promise<string>
const getResponseText: getResponseText = response => response.text()

type getFile = (ipfsUrl?: string) => (hash: string) => Promise<Response>
const getFile: getFile = (ipfsUrl = IPFS_URL) => hash => fetch(`${ipfsUrl}/api/v0/cat?arg=${hash}`)

interface FetchFileConfig {
  port: number
  host: string
}

type configureFetchFile = (config?: FetchFileConfig) => (hash: string) => Promise<string>
export const configureFetchFile: configureFetchFile = () => asyncPipe(getFile(), getResponseText)

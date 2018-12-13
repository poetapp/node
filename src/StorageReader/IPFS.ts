import fetch from 'node-fetch'

import { secondsToMiliseconds } from 'Helpers/Time'

export interface IPFSConfiguration {
  readonly ipfsUrl: string
  readonly downloadTimeoutInSeconds: number
}

export interface Arguments {
  readonly configuration: IPFSConfiguration
}

export interface IPFS {
  readonly cat: (hash: string) => Promise<string>
}

export const IPFS = ({
  configuration: {
    ipfsUrl,
    downloadTimeoutInSeconds,
  },
}: Arguments): IPFS => {

  const cat = async (hash: string): Promise<string> => {
    const response = await fetch(`${ipfsUrl}/api/v0/cat?arg=${hash}`, {
      timeout: secondsToMiliseconds(downloadTimeoutInSeconds),
    })
    return response.text()
  }

  return {
    cat,
  }
}

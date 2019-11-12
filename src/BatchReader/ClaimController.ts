import { InsertWriteOpResult } from 'mongodb'

import { DirectoryDAO } from './DirectoryDAO'
import { IPFS } from './IPFS'

export interface Dependencies {
  readonly directoryDAO: DirectoryDAO
  readonly ipfs: IPFS
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class ClaimController {
  private readonly directoryDAO: DirectoryDAO
  private readonly ipfs: IPFS

  constructor({
    dependencies: {
      directoryDAO,
      ipfs,
    },
  }: Arguments) {
    this.directoryDAO = directoryDAO
    this.ipfs = ipfs
  }

  addEntries = async (entries: ReadonlyArray<{ ipfsDirectoryHash: string }>): Promise<void> => {
    await this.directoryDAO.addEntries(entries)
  }

  readNextDirectory = async (): Promise<{ ipfsDirectoryHash: string; ipfsFileHashes: ReadonlyArray<string> }> => {
    const collectionItem = await this.directoryDAO.findNextEntry()
    if (!collectionItem) return
    const { ipfsDirectoryHash } = collectionItem
    await this.directoryDAO.incEntryAttempts({ ipfsDirectoryHash })
    const ipfsFileHashes = await this.ipfs.getDirectoryFileHashes(ipfsDirectoryHash)
    await this.directoryDAO.updateFileHashes({ ipfsDirectoryHash, ipfsFileHashes })
    await this.directoryDAO.setEntrySuccessTime({ ipfsDirectoryHash })
    return { ipfsDirectoryHash, ipfsFileHashes }
  }
}

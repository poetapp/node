import { inject, injectable } from 'inversify'
import { InsertWriteOpResult } from 'mongodb'

import { DirectoryDAO } from './DirectoryDAO'
import { IPFS } from './IPFS'

@injectable()
export class ClaimController {
  private readonly directoryDAO: DirectoryDAO
  private readonly ipfs: IPFS

  constructor(@inject('DirectoryDAO') directoryDAO: DirectoryDAO, @inject('IPFS') ipfs: IPFS) {
    this.directoryDAO = directoryDAO
    this.ipfs = ipfs
  }

  addEntries = (entries: ReadonlyArray<{ ipfsDirectoryHash: string }>): Promise<InsertWriteOpResult> =>
    this.directoryDAO.addEntries(entries)

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

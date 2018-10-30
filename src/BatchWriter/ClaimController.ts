import { inject, injectable } from 'inversify'

import { NoMoreEntriesException } from 'Exceptions'

import { FileDAO } from './FileDAO'
import { IPFS } from './IPFS'

@injectable()
export class ClaimController {
  private readonly fileDAO: FileDAO
  private readonly ipfs: IPFS

  constructor(@inject('FileDAO') fileDAO: FileDAO, @inject('IPFS') ipfs: IPFS) {
    this.fileDAO = fileDAO
    this.ipfs = ipfs
  }

  addEntry = (entry: { ipfsFileHash: string }) => this.fileDAO.addEntry(entry)

  createNextBatch = async (): Promise<{ ipfsFileHashes: ReadonlyArray<string>; ipfsDirectoryHash: string }> => {
    const items = await this.fileDAO.findNextEntries()

    if (!items.length) throw new NoMoreEntriesException('No more ipfsFilesHashes to batch')

    const ipfsFileHashes = items.map(x => x.ipfsFileHash)
    const emptyDirectoryHash = await this.ipfs.createEmptyDirectory()
    const ipfsDirectoryHash = await this.ipfs.addFilesToDirectory({
      ipfsDirectoryHash: emptyDirectoryHash,
      ipfsFileHashes,
    })
    await this.completeHashes({ ipfsFileHashes, ipfsDirectoryHash })
    return { ipfsFileHashes, ipfsDirectoryHash }
  }

  completeHashes = async ({
    ipfsFileHashes,
    ipfsDirectoryHash,
  }: {
    ipfsFileHashes: ReadonlyArray<string>
    ipfsDirectoryHash: string,
  }) => {
    await this.fileDAO.completeEntries(ipfsFileHashes.map(ipfsFileHash => ({ ipfsFileHash, ipfsDirectoryHash })))
  }
}

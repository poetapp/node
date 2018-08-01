export interface ReadEntry {
  _id?: string
  attempts: number
  ipfsDirectoryHash: string
  ipfsFileHashes: ReadonlyArray<string>
  lastAttemptTime?: number
  successTime?: number
}

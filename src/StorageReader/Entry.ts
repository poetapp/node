export interface Entry {
  readonly _id?: string
  readonly ipfsFileHash: string
  readonly claimId?: string
  readonly lastDownloadAttempt?: number
  readonly downloadSuccessTime?: number
  readonly downloadAttempts?: number
}

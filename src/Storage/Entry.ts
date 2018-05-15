export interface Entry {
  readonly _id?: string
  readonly ipfsHash: string
  readonly claimId?: string
  readonly lastDownloadAttempt?: number
  readonly lastDownloadSuccess?: number
  readonly downloadAttempts?: number
}

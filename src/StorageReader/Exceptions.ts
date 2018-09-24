// tslint:disable:max-classes-per-file

import { isFetchTimeoutError } from 'Helpers/FetchError'
import { FailureReason } from './DownloadFailure'

export class NoMoreEntriesException extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class InvalidClaim extends Error {
  readonly ipfsFileHash: string
  readonly failureReason: FailureReason

  constructor(ipfsFileHash: string, failureReason: FailureReason) {
    super()
    this.ipfsFileHash = ipfsFileHash
    this.failureReason = failureReason
  }
}

export class IPFSGenericError extends Error {
  readonly ipfsFileHash: string
  readonly underlyingError: Error

  constructor(ipfsFileHash: string, underlyingError: Error) {
    super()
    this.ipfsFileHash = ipfsFileHash
    this.underlyingError = underlyingError
  }
}

export class IPFSTimeoutError extends Error {
  readonly ipfsFileHash: string

  constructor(ipfsFileHash: string) {
    super()
    this.ipfsFileHash = ipfsFileHash
  }
}

export const errorToIPFSError = (ipfsFileHash: string) => (error: Error) =>
  isFetchTimeoutError(error) ? new IPFSTimeoutError(ipfsFileHash) : new IPFSGenericError(ipfsFileHash, error)

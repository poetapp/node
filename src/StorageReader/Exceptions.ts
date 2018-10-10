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
  readonly failureTime?: number

  constructor(ipfsFileHash: string, failureReason: FailureReason, failureTime: number) {
    super()
    this.ipfsFileHash = ipfsFileHash
    this.failureReason = failureReason
    this.failureTime = failureTime
  }
}

export class IPFSGenericError extends Error {
  readonly ipfsFileHash: string
  readonly underlyingError: Error
  readonly failureTime: number

  constructor(ipfsFileHash: string, underlyingError: Error, failureTime: number) {
    super()
    this.ipfsFileHash = ipfsFileHash
    this.underlyingError = underlyingError
    this.failureTime = failureTime
  }
}

export class IPFSTimeoutError extends Error {
  readonly ipfsFileHash: string
  readonly failureTime: number

  constructor(ipfsFileHash: string, failureTime: number) {
    super()
    this.ipfsFileHash = ipfsFileHash
    this.failureTime = failureTime
  }
}

export const errorToIPFSError = (ipfsFileHash: string) => (error: Error) =>
  isFetchTimeoutError(error)
    ? new IPFSTimeoutError(ipfsFileHash, new Date().getTime())
    : new IPFSGenericError(ipfsFileHash, error, new Date().getTime())

import { isSignedVerifiableClaim, SignedVerifiableClaim } from '@po.et/poet-js'
import { has, allPass } from 'ramda'

export interface ClaimIPFSHashPair {
  readonly claim: SignedVerifiableClaim
  readonly ipfsFileHash: string
}

const hasClaim = has('claim')
const hasIPFSFileHash = has('ipfsFileHash')
const isValidClaim = (o: ClaimIPFSHashPair) => isSignedVerifiableClaim(o.claim)

export const isClaimIPFSHashPair = allPass([hasClaim, hasIPFSFileHash, isValidClaim])

export interface ClaimIdIPFSHashPair {
  readonly claimId: string
  readonly ipfsFileHash: string
}

export interface IPFSHashFailure {
  readonly ipfsFileHash: string
  readonly failureType: string
  readonly failureReason: string
  readonly failureTime: number
}
const hasFailureType = has('failureType')
const hasFailureReason = has('failureReason')
const hasFailureTime = has('failureTime')
export const isIPFSHashFailure = allPass([hasIPFSFileHash, hasFailureReason, hasFailureType, hasFailureTime])

export interface UpdateAnchorAttemptInfo {
  readonly ipfsDirectoryHash: string
  readonly txId: string
}

export interface AnchorRetryDAOResult {
  readonly _id: number
  readonly count: number
}

export interface AnchorRetryCount {
  readonly attempts: number
  readonly count: number
}

export type AnchorRetryReport = ReadonlyArray<AnchorRetryCount>

export type getAnchorRetryHealth = () => Promise<AnchorRetryReport>

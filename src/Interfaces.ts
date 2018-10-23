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

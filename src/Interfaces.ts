import { isClaim, Claim } from '@po.et/poet-js'

export interface ClaimIPFSHashPair {
  readonly claim: Claim
  readonly ipfsHash: string
}

export function isClaimIPFSHashPair(o: any): o is ClaimIPFSHashPair {
  return o.claim && isClaim(o.claim) && o.ipfsHash
}

export interface ClaimIdIPFSHashPair {
  readonly claimId: string
  readonly ipfsHash: string
}

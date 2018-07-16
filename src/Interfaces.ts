import { isClaim, Claim } from '@po.et/poet-js'

export interface TransactionPoetTimestamp {
  readonly transactionId: string
  readonly outputIndex: number
  readonly prefix: string
  readonly version: ReadonlyArray<number>
  readonly ipfsHash: string
}

export interface PoetTimestamp extends TransactionPoetTimestamp {
  readonly blockHeight: number
  readonly blockHash: string
}

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

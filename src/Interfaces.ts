/**
 * General interfaces for types used by the Po.et Node.
 * These will be moved to poet-js in the future.
 */

export interface Claim<T extends ClaimAttributes = ClaimAttributes> {
  readonly id?: string

  readonly publicKey?: string
  readonly signature?: string
  readonly dateCreated?: Date

  readonly type: ClaimType
  readonly attributes: T
}

export function isClaim(object: any): object is Claim {
  // TODO: use joi or protobuf
  return object.id && object.publicKey && object.signature && object.type && object.attributes
}

export interface ClaimAttributes {
  readonly [key: string]: string
}

export enum ClaimType {
  Work = 'Work'
}

export interface Work extends Claim<WorkAttributes> {}

export interface WorkAttributes extends ClaimAttributes {
  readonly name: string
  readonly datePublished: string
  readonly dateCreated: string
  readonly author: string
  readonly tags: string
  readonly content: string
}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}

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

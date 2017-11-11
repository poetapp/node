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

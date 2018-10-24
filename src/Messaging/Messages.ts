import { isSignedVerifiableClaim, PoetBlockAnchor } from '@po.et/poet-js'
import { pipe, not, allPass } from 'ramda'

export interface BlockDownloaded {
  readonly block: LightBlock
  readonly poetBlockAnchors: ReadonlyArray<PoetBlockAnchor>
}

export interface LightBlock {
  readonly hash: string
  readonly previousHash: string
  readonly height: number
}

const isNotClaim = pipe(
  isSignedVerifiableClaim,
  not
)

const allAreClaims = (array: ReadonlyArray<any>) => !array.some(isNotClaim)

export const isArrayOfPoetBlockAnchor = allPass([Array.isArray, allAreClaims])

export const isBlockDownloaded = (messageContent: any): messageContent is BlockDownloaded => {
  const { poetBlockAnchors } = messageContent
  return isArrayOfPoetBlockAnchor(poetBlockAnchors)
}

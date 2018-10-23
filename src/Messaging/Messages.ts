import { isClaim, PoetBlockAnchor } from '@po.et/poet-js'
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

export const isBlockDownloaded = (messageContent: any): messageContent is BlockDownloaded => {
  const { poetBlockAnchors } = messageContent

  const isNotClaim = pipe(
    isClaim,
    not
  )

  return allPass([Array.isArray(poetBlockAnchors), !poetBlockAnchors.some(isNotClaim)])
}

// tslint:disable:max-classes-per-file

import { PoetAnchor } from '@po.et/poet-js'

export class IllegalPrefixLength extends Error {}

export class IllegalVersionLength extends Error {}

export const poetAnchorToData = (poetAnchor: PoetAnchor) => {
  if (poetAnchor.prefix.length !== 4) throw new IllegalPrefixLength()
  if (poetAnchor.version.length !== 2) throw new IllegalVersionLength()
  return Buffer.concat([
    Buffer.from(poetAnchor.prefix),
    Buffer.from([...poetAnchor.version]),
    Buffer.from([poetAnchor.storageProtocol]),
    Buffer.from(poetAnchor.ipfsDirectoryHash),
  ]).toString('hex')
}

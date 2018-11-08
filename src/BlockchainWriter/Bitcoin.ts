// tslint:disable:max-classes-per-file

import { PoetAnchor } from '@po.et/poet-js'
import * as bs58 from 'bs58'

export class IllegalPrefixLength extends Error {}

export class IllegalVersionLength extends Error {}

const uint16ToBuffer = (version: number) => {
  const buffer = Buffer.alloc(2)
  buffer.writeUInt16BE(version, 0)
  return buffer
}

export const poetAnchorToData = (poetAnchor: PoetAnchor) => {
  if (poetAnchor.prefix.length !== 4) throw new IllegalPrefixLength()

  const version = uint16ToBuffer(poetAnchor.version)

  return Buffer.concat([
    Buffer.from(poetAnchor.prefix),
    version,
    Buffer.from([poetAnchor.storageProtocol]),
    bs58.decode(poetAnchor.ipfsDirectoryHash),
  ]).toString('hex')
}

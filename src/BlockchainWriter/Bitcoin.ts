// tslint:disable:max-classes-per-file

import * as bs58 from 'bs58'

export class IllegalPrefixLength extends Error {}

export class IllegalVersionLength extends Error {}

declare enum StorageProtocolRefactor {
  IPFS = 0,
}
interface PoetAnchorRefactor {
  readonly prefix: string
  readonly version: number
  readonly storageProtocol: StorageProtocolRefactor
  readonly ipfsDirectoryHash: string
}

export const poetAnchorToData = (poetAnchor: PoetAnchorRefactor) => {
  if (poetAnchor.prefix.length !== 4) throw new IllegalPrefixLength()
  // if (poetAnchor.version.length !== 2) throw new IllegalVersionLength()
  const version = Buffer.allocUnsafe(2)
  version.writeUInt16BE(poetAnchor.version, 0)

  return Buffer.concat([
    Buffer.from(poetAnchor.prefix),
    version,
    Buffer.from([poetAnchor.storageProtocol]),
    bs58.decode(poetAnchor.ipfsDirectoryHash),
  ]).toString('hex')
}

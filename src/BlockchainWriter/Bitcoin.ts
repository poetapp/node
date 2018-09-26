import { PoetAnchor } from '@po.et/poet-js'

export const poetAnchorToData = (poetAnchor: PoetAnchor) => {
  if (poetAnchor.prefix.length !== 4) throw new Error('')
  if (poetAnchor.version.length !== 2) throw new Error('')
  return Buffer.concat([
    Buffer.from(poetAnchor.prefix),
    Buffer.from([...poetAnchor.version]),
    Buffer.from([poetAnchor.storageProtocol]),
    Buffer.from(poetAnchor.ipfsDirectoryHash),
  ]).toString('hex')
}

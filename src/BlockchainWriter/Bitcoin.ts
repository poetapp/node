import { StorageProtocol } from '@po.et/poet-js'

export const getData = (prefix: string, version: ReadonlyArray<number>) => (
  protocol: StorageProtocol,
  message: string
) => {
  if (prefix.length !== 4) throw new Error('')
  if (version.length !== 2) throw new Error('')
  return Buffer.concat([
    Buffer.from(prefix),
    Buffer.from([...version]),
    Buffer.from([protocol]),
    Buffer.from(message),
  ]).toString('hex')
}


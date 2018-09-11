export const getData = (prefix: string, version: ReadonlyArray<number>) => (message: string) =>
  Buffer.concat([Buffer.from(prefix), Buffer.from([...version]), Buffer.from(message)]).toString('hex')

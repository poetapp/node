declare module 'bs58' {
  export function encode(input: Buffer | ReadonlyArray<Buffer>): string
  export function decode(input: string): Buffer
}

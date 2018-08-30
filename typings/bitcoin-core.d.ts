declare module 'bitcoin-core' {
  interface Configuration {
    host?: string
    port?: number
    network?: string
    username?: string
    password?: string
  }

  class BitcoinCore {
    constructor(configuration: Configuration)
    listUnspent(): any
    generate(count: number): any
    getBlockchainInfo(): any
    getBalance(): any
    getBlock(hash: string, verbosity?: number): any
    getBlockHash(height: number): string
  }

  export = BitcoinCore
}

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
    getNewAddress(): Promise<string>
    getNetworkInfo(): any
    getWalletInfo(): any
    createRawTransaction(inputs: any, outputs: any): Promise<string>
    fundRawTransaction(hexstring: string): Promise<FundRawTransactionResponse>
    signRawTransaction(hexstring: string): Promise<SignRawTransactionResponse>
    sendRawTransaction(hexstring: string): Promise<string>
    estimateSmartFee(blocks: number): Promise<EstimateSmartFeeResponse>
  }

  interface FundRawTransactionResponse {
    readonly hex: string
    readonly changepos: number
    readonly fee: number
  }

  interface SignRawTransactionResponse {
    readonly hex: string
    readonly complete: boolean
  }

  interface EstimateSmartFeeResponse {
    readonly feerate: number
    readonly blocks: number
  }

  export = BitcoinCore
}

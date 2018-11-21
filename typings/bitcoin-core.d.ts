declare module 'bitcoin-core' {
  interface Configuration {
    host?: string
    port?: number
    network?: string
    username?: string
    password?: string
  }

  interface RejectStatus {
    status: boolean
  }

  interface Softfork {
    id?: string
    version?: number
    reject?: RejectStatus
  }

  interface bip9Softfork {
    status?: string
    startTime: number
    timeout: number
    since: number
  }

  interface Bip9Softforks {
    [key: string]: bip9Softfork
  }

  interface BitcoinBlockInfo {
    chain?: string
    blocks?: number
    headers?: number
    bestblockhash?: string
    difficulty?: number
    mediantime?: number
    verificationprogress?: number
    initialblockdownload?: boolean
    chainwork?: number
    size_on_disk?: number
    pruned?: boolean
    softforks?: ReadonlyArray<Softfork>
    bip9_softforks?: Bip9Softforks
    warnings?: string
  }

  class BitcoinCore {
    constructor(configuration: Configuration)
    listUnspent(): any
    generate(count: number): any
    getBlockchainInfo(): BitcoinBlockInfo
    getBalance(): any
    getBlock(hash: string, verbosity?: number): any
    getBlockHash(height: number): string
    getNewAddress(): Promise<string>
    getNetworkInfo(): any
    getWalletInfo(): any
    createRawTransaction(inputs: any, outputs: any): Promise<string>
    fundRawTransaction(hexstring: string): Promise<FundRawTransactionResponse>
    signRawTransaction(hexstring: string): Promise<SignRawTransactionResponse>
    signRawTransactionWithWallet(hexstring: string): Promise<SignRawTransactionResponse>
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

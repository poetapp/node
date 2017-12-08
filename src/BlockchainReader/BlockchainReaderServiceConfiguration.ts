export interface BlockchainReaderServiceConfiguration {
  readonly minimumBlockHeight: number
  readonly blockchainReaderIntervalInSeconds: number
  readonly forceBlockHeight?: number
}

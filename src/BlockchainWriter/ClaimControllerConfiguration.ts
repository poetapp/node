export interface ClaimControllerConfiguration {
  readonly insightUrl: string
  readonly dbUrl: string
  readonly bitcoinAddress: string
  readonly bitcoinAddressPrivateKey: string
  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>
}
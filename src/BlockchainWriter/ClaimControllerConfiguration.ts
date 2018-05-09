export interface ClaimControllerConfiguration {
  readonly bitcoinAddress: string
  readonly bitcoinAddressPrivateKey: string
  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>
}

export interface Configuration {
  readonly rabbitmqUrl: string
  readonly mongodbUrl: string
  readonly ipfsUrl: string
  readonly insightUrl: string
  readonly s3Url: string

  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>
  readonly minimumBlockHeight: number
  readonly bitcoinAddress: string
  readonly bitcoinAddressPrivateKey: string
}

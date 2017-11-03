export interface Configuration {
  readonly rabbitmqUrl: string
  readonly mongodbUrl: string
  readonly ipfsUrl: string
  readonly s3Url: string

  readonly minimumBlockHeight: number
}

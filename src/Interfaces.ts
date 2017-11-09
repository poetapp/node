export interface Claim {
  readonly id: string
  readonly publicKey: string
  readonly signature: string
  readonly type: string
  readonly attributes: {
    readonly [index: string]: string
  }
}
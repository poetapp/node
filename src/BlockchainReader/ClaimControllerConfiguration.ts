export interface ClaimControllerConfiguration {
  readonly insightUrl: string
  readonly dbUrl: string
  readonly poetNetwork: string
  readonly poetVersion: ReadonlyArray<number>
}
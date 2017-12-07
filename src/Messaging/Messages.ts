import { BlockchainPoetTimestamp } from 'Helpers/Bitcoin'

export enum Exchange {
  NewClaim = 'NEW_CLAIM', // Event, a new claim has been submitted by a client
  ClaimIPFSHash = 'CLAIM_IPFS_HASH', // Event, the IPFS hash of a claim has been discovered
  IPFSHashTxId = 'IPFS_HAS_TX_ID', // Event, the ID of the blockchain transaction in which this IPFS hash was stored has been discovered
  PoetTimestamp = 'POET_TIMESTAMP', // Event, a Poet Timestamp was retrieved from the blockchain
}

export interface BlockchainPoetTimestampMessage {
  readonly blockHeight: number
  readonly blockHash: string
  readonly poetMessages: ReadonlyArray<BlockchainPoetTimestamp>
}

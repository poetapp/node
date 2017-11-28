export enum Exchange {
  NewClaim = 'NEW_CLAIM', // Event, a new claim has been submitted by a client
  ClaimIPFSHash = 'CLAIM_IPFS_HASH', // Event, the IPFS hash of a claim has been discovered
  ClaimTxId = 'CLAIM_TX_ID', // Event, the ID of the blockchain transaction in which this claim has been timestamped has been discovered
}

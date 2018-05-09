export enum Exchange {
  // Event, a new claim has been submitted by a client
  NewClaim = 'NEW_CLAIM',
  // Event, the IPFS hash of a claim has been discovered
  ClaimIPFSHash = 'CLAIM_IPFS_HASH',
  // Event, the ID of the blockchain transaction in which this IPFS hash
  // was stored has been discovered
  IPFSHashTxId = 'IPFS_HAS_TX_ID',
  PoetTimestampDownloaded = 'POET_TIMESTAMP_DOWNLOADED',
  ClaimsDownloaded = 'CLAIMS_DOWNLOADED',
}

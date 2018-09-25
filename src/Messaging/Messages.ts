export enum Exchange {
  BatchReaderReadNextDirectoryRequest = 'BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
  BatchReaderReadNextDirectorySuccess = 'BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
  BatchWriterCreateNextBatchRequest = 'BATCH_WRITER::CREATE_NEXT_BATCH_REQUEST',
  BatchWriterCreateNextBatchSuccess = 'BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',

  // Event, a new claim has been submitted by a client
  NewClaim = 'NEW_CLAIM',
  // Event, the IPFS hash of a claim has been discovered
  ClaimIPFSHash = 'CLAIM_IPFS_HASH',
  // Event, the ID of the blockchain transaction in which this IPFS hash
  // was stored has been discovered
  IPFSHashTxId = 'IPFS_HASH_TX_ID',
  PoetAnchorDownloaded = 'POET_ANCHOR_DOWNLOADED',
  ClaimsDownloaded = 'CLAIMS_DOWNLOADED',
}

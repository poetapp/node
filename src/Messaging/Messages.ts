export enum Exchange {
  BatchReaderReadNextDirectoryRequest = 'BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
  BatchReaderReadNextDirectorySuccess = 'BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
  BatchReaderReadNextDirectoryFailure = 'BATCH_READER::READ_NEXT_DIRECTORY_FAILURE',
  BatchWriterCreateNextBatchRequest = 'BATCH_WRITER::CREATE_NEXT_BATCH_REQEUST',
  BatchWriterCreateNextBatchSuccess = 'BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',
  BatchWriterCreateNextBatchFailure = 'BATCH_WRITER::CREATE_NEXT_BATCH_FAILURE',
  BatchWriterCompleteHashesRequest = 'BATCH_WRITER::COMPLETE_HASHES_REQEUST',
  BatchWriterCompleteHashesSuccess = 'BATCH_WRITER::COMPLETE_HASHES_SUCCESS',
  BatchWriterCompleteHashesFailure = 'BATCH_WRITER::COMPLETE_HASHES_FAILURE',
  BlockchainWriterTimestampRequest = 'BLOCKCHAIN_WRITER::TIMESTAMP_REQUEST',
  BlockchainWriterTimestampSuccess = 'BLOCKCHAIN_WRITER::TIMESTAMP_SUCCESS',
  BlockchainWriterTimestampFailure = 'BLOCKCHAIN_WRITER::TIMESTAMP_FAILURE',

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

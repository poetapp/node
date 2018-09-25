import { loadConfigurationWithDefaults } from 'Configuration'
const configuration = loadConfigurationWithDefaults()

export const Exchange = {
  BatchReaderReadNextDirectoryRequest: configuration.batchReaderReadNextDirectoryRequest,
  BatchReaderReadNextDirectorySuccess: configuration.batchReaderReadNextDirectorySuccess,
  BatchWriterCreateNextBatchRequest: configuration.batchWriterCreateNextBatchRequest,
  BatchWriterCreateNextBatchSuccess: configuration.batchWriterCreateNextBatchSuccess,

  // Event, a new claim has been submitted by a client
  NewClaim: configuration.newClaim,
  // Event, the IPFS hash of a claim has been discovered
  ClaimIPFSHash: configuration.claimIpfsHash,
  // Event, the ID of the blockchain transaction in which this IPFS hash
  // was stored has been discovered
  IPFSHashTxId: configuration.ipfsHashTxId,
  PoetAnchorDownloaded: configuration.poetAnchorDownloaded,
  ClaimsDownloaded: configuration.claimsDownloaded,
}

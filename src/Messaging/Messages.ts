import { loadConfigurationWithDefaults } from 'Configuration'
const configuration = loadConfigurationWithDefaults()

export const Exchange = {
  BatchReaderReadNextDirectoryRequest: configuration.exchangeBatchReaderReadNextDirectoryRequest,
  BatchReaderReadNextDirectorySuccess: configuration.exchangeBatchReaderReadNextDirectorySuccess,
  BatchWriterCreateNextBatchRequest: configuration.exchangeBatchWriterCreateNextBatchRequest,
  BatchWriterCreateNextBatchSuccess: configuration.exchangeBatchWriterCreateNextBatchSuccess,

  // Event, a new claim has been submitted by a client
  NewClaim: configuration.exchangeNewClaim,
  // Event, the IPFS hash of a claim has been discovered
  ClaimIPFSHash: configuration.exchangeClaimIpfsHash,
  // Event, the ID of the blockchain transaction in which this IPFS hash
  // was stored has been discovered
  IPFSHashTxId: configuration.exchangeIpfsHashTxId,
  PoetAnchorDownloaded: configuration.exchangePoetAnchorDownloaded,
  ClaimsDownloaded: configuration.exchangeClaimsDownloaded,
}

# Module Communication

This document describes communication between the high level modules of the poet node.

## Writing Claims

- initial
  - **API** User posts a new work to node using `POST /works`, publishes `newClaim`

- on `newClaim`
  - **View** stores the claim information into the work collection
  - **StorageWriter** asynchronously adds the claim to IPFS, then publishes `ClaimIPFSHash`

- on `ClaimIPFSHash`
  - **BatchWriter** Stores an entry to be batched
  - **View** adds the ipfsFileHash to matching claim entry

- on `BatchWriterCreateNextBatchRequest` (published on set interval)
  - **BatchWriter** groups files hashes into a directory and publishes `BatchWriterCreateNextBatchSuccess`

- on `BatchWriterCreateNextBatchSuccess`
  - **BlockchainWriter** stores ipfsDirectoryHash to anchor to the blockchain, publishes `IPFSHashTxId` after anchoring.
  - **View** adds ipfsDirectoryHash to work entries

- on `IPFSHashTxId`
  - **View** adds transaction ID to work entries



## Reading Claims

- initial
  - **BlockchainReader** reads block and publishes `PoetAnchorDownloaded`

- on `PoetAnchorDownloaded`
  - **BatchReader** stores ipfsDirectoryHash in collection queue for reading 
  - **View** stores anchor information in an anchor collection

- on `BatchReaderReadNextDirectoryRequest` (published on set interval)
  - **BatchReader** reads next directory and publishes `BatchReaderReadNextDirectorySuccess`

- on `BatchReaderReadNextDirectorySuccess`
  - **Storage** stores the ipfsFileHashes to download 
  - **View** creates/updates work entry per ipfsFileHash, copies anchor data from the anchor collection for the work entry. Copying the anchor data also fills in missing anchor information from write flow work entries.

- on `ClaimsDownloaded`
  - **View** Adds claim to work entry

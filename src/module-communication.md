# Module Communication

This document describes communication between the high level modules of the poet node.

## Writing Claims

- initial: User posts a new work to node using `POST /works`
  - **API** publishes `newClaim`

- on `newClaim`
  - **View** stores the claim information into the work collection
  - **Storage** adds the claim to IPFS, then publishes `ClaimIPFSHash`

- on `ClaimIPFSHash`
  - **BatchWriter** Stores an entry to be batched
  - **View** adds the ipfsFileHash to matching claim entry

- on `BatchWriterCreateNextBatchRequest`
  - **BatchWriter** groups files hashes into a directory and publishes `BatchWriterCreateNextBatchSuccess`

- on `BatchWriterCreateNextBatchSuccess`
  - **BlockchainWriter** stores ipfsDirectoryHash to anchor to the blockchain, publishes `IPFSHashTxId` after anchoring.
  - **View** adds ipfsDirectoryHash to work entries

- on `IPFSHashTxId`
  - **View** adds transaction ID to work entries



## Reading Claims

- initial
  - **BlockchainReader** reads block and publishes `PoetTimestampDownloaded`

- on `PoetTimestampDownloaded`
  - **BatchReader** stores ipfsDirectoryHash to read
  - **View** stores timestamp information in a timestamp collection

- on `BatchReaderReadNextDirectoryRequest`
  - **BatchReader** reads next directory and publishes `BatchReaderReadNextDirectorySuccess`

- on `BatchReaderReadNextDirectorySuccess`
  - **Storage** stores the ipfsFileHashes to download 
  - **View** creates/updates work entry per ipfsFileHash

- on `ClaimsDownloaded`
  - **View** Adds claim to work entry

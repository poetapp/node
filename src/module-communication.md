# Module Communication

This document describes communication between the high level modules of the poet node.

## Writing Claims

- initial: claim gets posted.
  - **API** publishes `newClaim`

- on `newClaim`
  - **View** stores the claim information into the work collection
  - **Storage** adds the claim to IPFS, then publishes `ClaimIPFSHash`

- on `ClaimIPFSHash`
  - **BatchWriter** Stores an entry to be batched
  - **View** adds the ipfsFileHash to matching claim entry

- on `IPFSHashTxId`

- on `PoetTimestampDownloaded`

- on `ClaimsDownloaded`

- on `BatchWriterCreateNextBatchRequest`

- on `BatchWriterCreateNextBatchSuccess`

## Reading Claims

- on `BatchReaderReadNextDirectoryRequest`
  - **BatchReader** reads next directory and publishes `BatchReaderReadNextDirectorySuccess`

- on `BatchReaderReadNextDirectorySuccess`
  - **Storage** stores all the ipfsFileHashes to download
  - **View** 
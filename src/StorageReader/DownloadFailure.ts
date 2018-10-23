export enum FailureType {
  Soft = 'SOFT',
  Hard = 'HARD',
}

export enum FailureReason {
  InvalidJson = 'INVALID_JSON',
  InvalidSignedVerifiableClaim = 'INVALID_SIGNED_VERIFIABLE_CLAIM',
  IPFSGeneric = 'IPFS_GENERIC',
  IPFSTimeout = 'IPFS_TIMEOUT',
}

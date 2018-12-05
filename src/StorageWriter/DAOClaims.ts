import { SignedVerifiableClaim } from '@po.et/poet-js'
import { Collection, Db, FindAndModifyWriteOpResultObject } from 'mongodb'
import { isNil, pipeP, lensPath, view } from 'ramda'

import { NoMoreEntriesException } from './Exceptions'

export interface DAOClaimsConfiguration {
  readonly maxStorageAttempts: number
}

const L = {
  valueClaim: lensPath(['value', 'claim']),
}

export const getClaimFromFindAndUpdateResponse = (
  response: FindAndModifyWriteOpResultObject,
): SignedVerifiableClaim | undefined => view(L.valueClaim, response)

export const throwIfClaimNotFound = (claim: SignedVerifiableClaim): SignedVerifiableClaim => {
  if (isNil(claim)) throw new NoMoreEntriesException('No claims found')
  return claim
}

export interface Dependencies {
  readonly collection: Collection
}

export interface Configuration {
  readonly maxStorageAttempts: number
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: Configuration
}

export interface DAOClaims {
  readonly start: () => Promise<void>
  readonly findNextClaim: () => Promise<SignedVerifiableClaim>
  readonly addClaim: (claim: SignedVerifiableClaim) => Promise<void>
  readonly addClaimHash: (claimId: string, ipfsFileHash: string) => Promise<void>
}

export const DAOClaims = ({
  dependencies: {
    collection,
  },
  configuration: {
    maxStorageAttempts,
  },
}: Arguments): DAOClaims => {

  const start = async () => {
    await collection.createIndex({ 'claim.id': 1 }, { unique: true })
  }

  const addClaim = async (claim: SignedVerifiableClaim) => {
    await collection.insertOne({ claim, storageAttempts: 0, ipfsFileHash: null })
  }

  const addClaimHash = async (claimId: string, ipfsFileHash: string) => {
    await collection.updateOne({ 'claim.id': claimId }, { $set: { ipfsFileHash } })
  }

  const findClaimToStore = () =>
    collection.findOneAndUpdate(
      {
        $and: [{ ipfsFileHash: null }, { storageAttempts: { $lt: maxStorageAttempts } }],
      },
      {
        $inc: { storageAttempts: 1 },
        $set: { lastStorageAttemptTime: new Date().getTime() },
      },
    )

  const findNextClaim = pipeP(
    findClaimToStore,
    getClaimFromFindAndUpdateResponse,
    throwIfClaimNotFound,
  )

  return {
    start,
    findNextClaim,
    addClaim,
    addClaimHash,
  }
}

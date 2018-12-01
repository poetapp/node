import { SignedVerifiableClaim } from '@po.et/poet-js'
import { Collection } from 'mongodb'

export interface Dependencies {
  collection: Collection
}

export interface DAOIntegrityCheckFailures {
  addFailure: (
    claim: SignedVerifiableClaim,
    ipfsResponse: string,
    message: string,
    failureTime?: Date,
  ) => Promise<void>
}

export interface Arguments {
  dependencies: Dependencies
}

export const DAOIntegrityCheckFailures = ({
  dependencies: {
    collection,
  },
}: Arguments) => {
  const addFailure = async (
    claim: SignedVerifiableClaim,
    ipfsResponse: string,
    message: string,
    failureTime = new Date(),
  ) => {
    await collection.insertOne({ claim, ipfsResponse, message, failureTime })
  }

  return {
    addFailure,
  }
}

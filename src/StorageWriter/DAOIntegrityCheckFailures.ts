import { SignedVerifiableClaim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

@injectable()
export class DAOIntegrityCheckFailures {
  private readonly collection: Collection

  constructor(
    @inject('integrityCheckFailuresCollection') collection: Collection,
  ) {
    this.collection = collection
  }

  public readonly addFailure = async (
    claim: SignedVerifiableClaim,
    ipfsResponse: string,
    message: string,
    failureTime = new Date(),
  ) => {
    await this.collection.insertOne({ claim, ipfsResponse, message, failureTime })
  }
}

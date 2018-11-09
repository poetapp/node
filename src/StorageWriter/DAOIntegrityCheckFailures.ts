import { SignedVerifiableClaim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db} from 'mongodb'

@injectable()
export class DAOIntegrityCheckFailures {
  private readonly collection: Collection

  constructor(
    @inject('DB') db: Db,
  ) {
    this.collection = db.collection('storageWriterIntegrityCheckFailures')
  }

  public readonly addFailure = async (
    claim: SignedVerifiableClaim,
    ipfsResponse: string,
    message = '',
    failureTime = new Date(),
  ) => {
    await this.collection.insertOne({ claim, ipfsResponse, message, failureTime })
  }
}

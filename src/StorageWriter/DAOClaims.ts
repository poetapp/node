import { Claim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db, FindAndModifyWriteOpResultObject } from 'mongodb'
import { isNil, pipeP, lensPath, view } from 'ramda'

export interface DAOClaimsConfiguration {
  readonly maxStorageAttempts: number
}

const L = {
  valueClaim: lensPath(['value', 'claim']),
}

export const getClaimFromFindAndUpdateResponse = (response: FindAndModifyWriteOpResultObject): Claim | undefined =>
  view(L.valueClaim, response)

export const throwIfClaimNotFound = (claim: Claim): Claim => {
  if (isNil(claim)) throw new Error('No claims found')
  return claim
}

@injectable()
export class DAOClaims {
  private readonly collection: Collection
  private readonly maxStorageAttempts: number

  constructor(@inject('DB') db: Db, @inject('DAOClaimsConfiguration') configuration: DAOClaimsConfiguration) {
    this.collection = db.collection('storageWriterClaims')
    this.maxStorageAttempts = configuration.maxStorageAttempts
  }

  public readonly start = async () => {
    console.log('dao start')
    await this.collection.createIndex({ 'claim.id': 1 }, { unique: true })
  }

  public readonly addClaim = async (claim: Claim) => {
    await this.collection.insertOne({ claim, storageAttempts: 0, ipfsFileHash: null })
  }

  public readonly addClaimHash = async (claimId: string, ipfsFileHash: string) => {
    await this.collection.updateOne({ 'claim.id': claimId }, { $set: { ipfsFileHash } })
  }

  private readonly findClaimToStore = () =>
    this.collection.findOneAndUpdate(
      {
        $and: [{ ipfsFileHash: null }, { storageAttempts: { $lt: this.maxStorageAttempts } }],
      },
      {
        $inc: { storageAttempts: 1 },
        $set: { lastStorageAttemptTime: new Date().getTime() },
      }
    )

  // tslint:disable-next-line
  public readonly findNextClaim = pipeP(
    this.findClaimToStore,
    getClaimFromFindAndUpdateResponse,
    throwIfClaimNotFound
  )
}

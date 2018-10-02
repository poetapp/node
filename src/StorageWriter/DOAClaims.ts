import { Claim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import { Collection, Db, FindAndModifyWriteOpResultObject } from 'mongodb'
import { isNil, pipeP, lensPath, view } from 'ramda'

export interface DOAClaimsConfiguration {
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
export class DOAClaims {
  private readonly claims: Collection
  private readonly maxStorageAttempts: number

  constructor(@inject('DB') db: Db, @inject('DOAClaims') configuration: DOAClaimsConfiguration) {
    this.claims = db.collection('storageWriterClaims')
    this.maxStorageAttempts = configuration.maxStorageAttempts
  }

  public readonly start = async () => {
    await this.claims.createIndex({ "claim.id": 1 }, { unique: true })
  }

  public readonly addClaim = async (claim: Claim) => {
    await this.claims.insertOne({ claim, storageAttempts: 0, ipfsFileHash: null })
  }

  public readonly addClaimHash = async (claimId: string, ipfsFileHash: string) => {
    await this.claims.updateOne({ "claim:id" : claimId }, { $set: { ipfsFileHash } })
  }

  private readonly findClaimToStore = () =>
    this.claims.findOneAndUpdate(
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

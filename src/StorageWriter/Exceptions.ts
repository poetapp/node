import { Claim } from '@po.et/poet-js'

export enum ErrorTypes {
  UPLOAD_CLAIM_ERROR = 'UPLOAD_CLAIM_ERROR',
  UPDATE_CLAIM_HASH_ERROR = 'UPDATE_CLAIM_HASH_ERROR',
}

export const uploadClaimError = (message: string, claim: Claim) => ({
  type: ErrorTypes.UPLOAD_CLAIM_ERROR,
  details: {
    message,
    claim,
  },
})

export const updateClaimHashError = (message: string, claim: Claim, hash: string) => ({
  type: ErrorTypes.UPDATE_CLAIM_HASH_ERROR,
  details: {
    message,
    claim,
    hash,
  },
})

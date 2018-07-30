import { Claim, isClaim } from '@po.et/poet-js'

// TODO: either move to poet-js or change Claim interface for dateCreated to be string
export const claimFromJSON = (json: any): Claim => {
  const claimLike = {
    ...json,
    dateCreated: new Date(json.dateCreated),
  }

  if (isNaN(claimLike.dateCreated)) return null // TODO: return Either.Left('Provided JSON is not a claim.')

  if (!isClaim(claimLike)) return null // TODO: return Either.Left('Provided JSON is not a claim.')

  return claimLike
}

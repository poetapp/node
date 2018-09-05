import { Claim, isClaim } from '@po.et/poet-js'

// TODO: either move to poet-js or change Claim interface for created to be string
export const claimFromJSON = (json: any): Claim => {

  if (isNaN(json.created)) return null // TODO: return Either.Left('Provided JSON is not a claim.')

  if (!isClaim(json)) return null // TODO: return Either.Left('Provided JSON is not a claim.')

  return json
}

import { Claim, ClaimType, Work } from '../Interfaces'

export function isClaim(object: any): object is Claim {
  // TODO: use joi or protobuf
  return object.id && object.publicKey && object.signature && object.type && object.attributes
}

export function isValidSignature(claim: Claim) {
  // TODO: placeholder function. in the future, do something like
  // bitcore.crypto.ECDSA.verify(
  //   claim.id,
  //   claim.idsignature,
  //   claim.publicKey
  // )
  return true
}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}
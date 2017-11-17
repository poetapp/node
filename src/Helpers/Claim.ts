import * as bitcore from 'bitcore-lib'

import { Claim, ClaimType, Work } from '../Interfaces'

export function isClaim(object: any): object is Claim {
  // TODO: use joi or protobuf
  return object.id && object.publicKey && object.signature && object.type && object.attributes
}

export function isValidSignature(claim: Claim): boolean {
  return bitcore.crypto.ECDSA.verify(
    Buffer.from(claim.id, 'hex'),
    bitcore.crypto.Signature.fromString(claim.signature),
    new bitcore.PublicKey(claim.publicKey)
  )
}

export function isWork(claim: Claim): claim is Work {
  return claim.type === ClaimType.Work
}
import * as bitcore from 'bitcore-lib'

import { Claim, ClaimAttributes, ClaimType, Work } from '../Interfaces'
import { Serialization } from './Serialization'
import { Signature } from './Signature'

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

export function createClaim(privateKey: string, type: ClaimType, attributes: ClaimAttributes): Claim {
  const claim: Claim = {
    id: '',
    publicKey: new bitcore.PrivateKey(privateKey).publicKey.toString(),
    signature: '',
    type,
    dateCreated: new Date(),
    attributes
  }
  const id = Serialization.getClaimId(claim)
  const signature = Signature.signClaim({
    ...claim,
    id
  }, privateKey)
  return {
    ...claim,
    id,
    signature
  }

}

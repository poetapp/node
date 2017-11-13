import * as bitcore from 'bitcore-lib'

import { IllegalArgumentException } from '../API/Exceptions'
import { Claim } from '../Interfaces'
import { Serialization } from './Serialization'

export namespace Signature {
  export function signClaim(claim: Claim, privateKey: string): string {
    if (!claim.publicKey)
      throw new IllegalArgumentException('Cannot sign a claim that has an empty .publicKey field.')
    if (new bitcore.PrivateKey(privateKey).publicKey.toString() !== claim.publicKey)
      throw new IllegalArgumentException('Cannot sign this claim with the provided privateKey. It doesn\t match the claim\'s public key.')
    if (!claim.id)
      throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field.')
    if (claim.id !== Serialization.getClaimId(claim))
      throw new IllegalArgumentException('Cannot sign a claim whose id has been altered or generated incorrectly.')

    const signature = bitcore.crypto.ECDSA.sign(Buffer.from(claim.id, 'hex'), bitcore.PrivateKey(privateKey))
    return signature.toString()
  }
}
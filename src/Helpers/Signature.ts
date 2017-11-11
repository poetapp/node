import * as bitcore from 'bitcore-lib'

import { IllegalArgumentException } from '../API/Exceptions'
import { Claim } from '../Interfaces'

export namespace Signature {
  export function signClaim(claim: Claim, privateKey: string): string {
    if (!claim.id)
      throw new IllegalArgumentException('Cannot sign a claim that has an empty .id field.')
    const signature = bitcore.crypto.ECDSA.sign(Buffer.from(claim.id, 'hex'), bitcore.PrivateKey(privateKey))
    return signature.toString()
  }
}
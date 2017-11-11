import * as bitcore from 'bitcore-lib'

import { Claim } from '../Interfaces'

export namespace Signature {
  export function signClaim(claim: Claim, privateKey: string): string {
    const signature = bitcore.crypto.ECDSA.sign(Buffer.from(claim.id, 'hex'), bitcore.PrivateKey(privateKey))
    return signature.toString()
  }
}
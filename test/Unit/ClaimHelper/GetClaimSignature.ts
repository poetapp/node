import { Expect, Test, TestCase } from 'alsatian'

import { IllegalArgumentException } from 'API/Exceptions'
import { getClaimSignature } from 'Helpers/Claim'
import { Work } from 'Interfaces'

import { PrivateKey, TheRaven } from '../../Claims'

export class GetClaimSignature {

  @Test()
  @TestCase(TheRaven)
  public signature(work: Work) {
    Expect(getClaimSignature(work, PrivateKey)).toBe(work.signature)
  }

  @Test()
  @TestCase(TheRaven)
  public signatureMissingId(work: Work) {
    Expect(() => getClaimSignature({...work, id: ''}, PrivateKey))
      .toThrowError(IllegalArgumentException, 'Cannot sign a claim that has an empty .id field.')
  }

  @Test()
  @TestCase(TheRaven)
  public signatureIncorrectId(work: Work) {
    Expect(() => getClaimSignature({
      ...work, id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943102'
    }, PrivateKey)).toThrowError(IllegalArgumentException, 'Cannot sign a claim whose id has been altered or generated incorrectly.')
  }

  @Test()
  @TestCase(TheRaven)
  public signatureMissingPublicKey(work: Work) {
    Expect(() => getClaimSignature({
      ...work, publicKey: undefined
    }, PrivateKey)).toThrowError(IllegalArgumentException, 'Cannot sign a claim that has an empty .publicKey field.')
  }

  @Test()
  @TestCase(TheRaven)
  public signatureIncorrectPublicKey(work: Work) {
    Expect(() => getClaimSignature({
      ...work, publicKey: '03f0dc475e93105bdc7701b40003200039202ffd4a0789696c78f9b34d5518aef9'
    }, PrivateKey)).toThrowError(IllegalArgumentException, 'Cannot sign this claim with the provided privateKey. It doesn\t match the claim\'s public key.')
  }
}

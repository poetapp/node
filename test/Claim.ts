import { Expect, FocusTests, Test, TestCase } from 'alsatian'

import { createClaim, isValidSignature } from 'Helpers/Claim'
import { Signature } from 'Helpers/Signature'
import { ClaimType, Work } from 'Interfaces'

import { TheRaven, PrivateKey } from './Claims'
import { Key1 } from './Keys'

@FocusTests
export class ClaimTest {

  @Test()
  @TestCase(TheRaven, PrivateKey)
  public getClaimSignature(work: Work, privateKey: string) {
    Expect(Signature.signClaim(work, privateKey)).toBe(work.signature)
  }

  @Test()
  @TestCase(TheRaven, Key1.privateKey, Key1.publicKey)
  public createClaimPublicKey(work: Work, privateKey: string, publicKey: string) {
    const claim = createClaim(
      privateKey,
      ClaimType.Work,
      work.attributes
    )
    Expect(claim.publicKey).toBe(publicKey)
  }

  @Test()
  @TestCase(TheRaven, Key1.privateKey)
  public createClaimValidSignature(work: Work, privateKey: string) {
    const claim = createClaim(
      privateKey,
      ClaimType.Work,
      work.attributes
    )
    Expect(isValidSignature(claim)).toBeTruthy()
  }

}

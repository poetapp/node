import { Expect, FocusTests, Test, TestCase } from 'alsatian'

import { createClaim, isValidSignature, getClaimSignature } from 'Helpers/Claim'
import { ClaimType, Work } from 'Interfaces'

import { TheRaven } from './Claims'
import { Key1 } from './Keys'

export class ClaimTest {

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

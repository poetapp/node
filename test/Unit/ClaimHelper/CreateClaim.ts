import { Expect, Test, TestCase } from 'alsatian'

import { createClaim, isValidSignature } from 'Helpers/Claim'
import { ClaimType, Work } from 'Interfaces'

import { TheRaven } from '../../Claims'
import { Key1 } from '../../Keys'

export class CreateClaim {

  @Test()
  @TestCase(TheRaven, Key1.privateKey, Key1.publicKey)
  public publicKey(work: Work, privateKey: string, publicKey: string) {
    const claim = createClaim(
      privateKey,
      ClaimType.Work,
      work.attributes
    )
    Expect(claim.publicKey).toBe(publicKey)
  }

  @Test()
  @TestCase(TheRaven, Key1.privateKey)
  public validSignature(work: Work, privateKey: string) {
    const claim = createClaim(
      privateKey,
      ClaimType.Work,
      work.attributes
    )
    Expect(isValidSignature(claim)).toBeTruthy()
  }

}

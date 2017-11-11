import { Expect, Test, TestCase } from 'alsatian'

import { Signature } from '../src/Helpers/Signature'
import { Work } from '../src/Interfaces'
import { PrivateKey, TheRaven } from './Claims'

export class SignatureTest {

  @Test()
  @TestCase(TheRaven)
  public signature(work: Work) {
    const signature = Signature.signClaim(work, PrivateKey)
    Expect(signature.toString()).toBe(work.signature)
  }
}

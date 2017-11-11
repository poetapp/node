import { Expect, Test, TestCase } from 'alsatian'

import { Signature } from '../src/Helpers/Signature'
import { Work } from '../src/Interfaces'
import { PrivateKey, TheRaven } from './Claims'
import {IllegalArgumentException} from '../src/API/Exceptions'

export class SignatureTest {

  @Test()
  @TestCase(TheRaven)
  public signature(work: Work) {
    const signature = Signature.signClaim(work, PrivateKey)
    Expect(signature.toString()).toBe(work.signature)
  }

  @Test()
  @TestCase(TheRaven)
  public signatureWithoutId(work: Work) {
    Expect(() => Signature.signClaim({...work, id: ''}, PrivateKey))
      .toThrowError(IllegalArgumentException, 'Cannot sign a claim that has an empty .id field.')
  }
}

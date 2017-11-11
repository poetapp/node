import { Expect, Test, TestCase } from 'alsatian'

import { Serialization } from '../src/Helpers/Serialization'
import { Work } from '../src/Interfaces'
import { TheRaven } from './Claims'

export class SerializationTest {

  @Test()
  @TestCase(TheRaven)
  public claimId(work: Work) {
    const claimId = Serialization.getClaimId(work)
    Expect(claimId).toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIgnoresId(work: Work) {
    // The field .id is ignored in the calculation of the id
    const ignoreId = Serialization.getClaimId({
      ...work,
      id: '123'
    })
    Expect(ignoreId).toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIgnoresSignature(work: Work) {
    // The field .signature is ignored in the calculation of the id
    const ignoreSignature = Serialization.getClaimId({
      ...work,
      signature: '123'
    })
    Expect(ignoreSignature).toBe(work.id)
  }
}

import { Expect, Test, TestCase } from 'alsatian'

import { getClaimId } from 'Helpers/Claim'
import { Claim, ClaimType, Work } from 'Interfaces'

import { AStudyInScarlet, makeClaim, TheMurdersInTheRueMorgue, TheRaven } from '../../Claims'

export class GetClaimId {

  @Test()
  @TestCase(TheRaven)
  public claimId(work: Work) {
    const claimId = getClaimId(work)
    Expect(claimId).toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIgnoresId(work: Work) {
    // The field .id is ignored in the calculation of the id
    const ignoreId = getClaimId({
      ...work,
      id: '123'
    })
    Expect(ignoreId).toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIgnoresSignature(work: Work) {
    // The field .signature is ignored in the calculation of the id
    const ignoreSignature = getClaimId({
      ...work,
      signature: '123'
    })
    Expect(ignoreSignature).toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIncludesPublicKey(work: Work) {
    Expect(getClaimId({
      ...work,
      publicKey: '123'
    })).not.toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIncludesType(work: Work) {
    Expect(getClaimId({
      ...work,
      type: 'Asd' as ClaimType
    })).not.toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven)
  public claimIdIncludesDate(work: Work) {
    Expect(getClaimId({
      ...work,
      dateCreated: new Date()
    })).not.toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven.attributes.name, TheRaven.attributes.author)
  @TestCase(TheMurdersInTheRueMorgue.attributes.name, TheMurdersInTheRueMorgue.attributes.author)
  @TestCase(AStudyInScarlet.attributes.name, AStudyInScarlet.attributes.author)
  public claimIdShouldNotChangeWithAttributeOrdering(name: string, author: string) {
    const work1: Claim = makeClaim({
      name,
      author,
    })
    const work2: Claim = makeClaim({
      author,
      name,
    })

    Expect(getClaimId(work1)).toBe(getClaimId(work2))
  }

  @Test()
  @TestCase(TheRaven.attributes.name, TheRaven.attributes.author)
  @TestCase(TheMurdersInTheRueMorgue.attributes.name, TheMurdersInTheRueMorgue.attributes.author)
  @TestCase(AStudyInScarlet.attributes.name, AStudyInScarlet.attributes.author)
  public claimIdShouldNotChangeWithAttributeKeyCasing(name: string, author: string) {
    const work1: Claim = makeClaim({
      name,
      author,
    })
    const work2: Claim = makeClaim({
      Author: author,
      NAME: name,
    })

    Expect(getClaimId(work1)).toBe(getClaimId(work2))
  }

}

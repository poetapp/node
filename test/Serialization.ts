import { Expect, Test, TestCase } from 'alsatian'

import { Serialization } from '../src/Helpers/Serialization'
import { Claim, ClaimAttributes, ClaimType, Work } from '../src/Interfaces'
import { TheRaven, TheRavenHex } from './Claims'

/**
 * Simple function to help editing a Claim's attributes in an immutable fashion.
 * TODO: support generics once https://github.com/Microsoft/TypeScript/issues/10727 is fixed.
 */
function editAttributes(claim: Claim, attributes: ClaimAttributes): Claim {
  return {
    ...claim,
    attributes: {
      ...claim.attributes,
      ...attributes
    }
  }
}

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

  @Test()
  @TestCase(TheRaven)
  public claimToHex(work: Work) {
    const serializedClaim = Serialization.claimToHex(work)
    Expect(serializedClaim).toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven)
  public claimToHexFailIfChangedAttribute(work: Work) {
    // Changing any field should change the serialized too

    Expect(Serialization.claimToHex(editAttributes(work, {
      name: 'Nevermore'
    }))).not.toBe(TheRavenHex)

    Expect(Serialization.claimToHex(editAttributes(work, {
      author: 'E.A.P.'
    }))).not.toBe(TheRavenHex)

    Expect(Serialization.claimToHex(editAttributes(work, {
      dateCreated: (new Date()).toISOString()
    }))).not.toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven)
  public claimToHexFailIfChangedClaimData(work: Work) {
    // Changing any field should change the serialized too

    Expect(Serialization.claimToHex({
      ...work,
      publicKey: 'a' + work.publicKey.slice(1)
    })).not.toBe(TheRavenHex)

    Expect(Serialization.claimToHex({
      ...work,
      signature: 'b' + work.signature.slice(1)
    })).not.toBe(TheRavenHex)

    Expect(Serialization.claimToHex({
      ...work,
      type: 'Asd' as ClaimType
    })).not.toBe(TheRavenHex)
  }
}

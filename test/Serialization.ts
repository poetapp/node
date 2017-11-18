import { Expect, Test, TestCase } from 'alsatian'

import { Serialization } from 'Helpers/Serialization'
import { Claim, ClaimAttributes, ClaimType, Work } from 'Interfaces'

import { TheRaven, TheRavenHex } from './Claims'

export class SerializationTest {

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
  public claimToHexFailIfChangedClaimId(work: Work) {
    Expect(Serialization.claimToHex({
      ...work,
      id: 'X' + work.id.slice(1)
    })).not.toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven)
  public claimToHexFailIfChangedClaimPublicKey(work: Work) {
    Expect(Serialization.claimToHex({
      ...work,
      publicKey: 'a' + work.publicKey.slice(1)
    })).not.toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven)
  public claimToHexFailIfChangedClaimSignature(work: Work) {
    Expect(Serialization.claimToHex({
      ...work,
      signature: 'b' + work.signature.slice(1)
    })).not.toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven)
  public claimToHexFailIfChangedClaimType(work: Work) {
    Expect(Serialization.claimToHex({
      ...work,
      type: 'Asd' as ClaimType
    })).not.toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven)
  public claimToHexFailIfChangedClaimDate(work: Work) {
    Expect(Serialization.claimToHex({
      ...work,
      dateCreated: new Date()
    })).not.toBe(TheRavenHex)
  }

  @Test()
  @TestCase(TheRaven, TheRavenHex)
  public hexToClaimMatchId(work: Work, hex: string) {
    Expect(Serialization.hexToClaim(hex).id).toBe(work.id)
  }

  @Test()
  @TestCase(TheRaven, TheRavenHex)
  public hexToClaimPublicKey(work: Work, hex: string) {
    Expect(Serialization.hexToClaim(hex).publicKey).toBe(work.publicKey)
  }

  @Test()
  @TestCase(TheRaven, TheRavenHex)
  public hexToClaimSignature(work: Work, hex: string) {
    Expect(Serialization.hexToClaim(hex).signature).toBe(work.signature)
  }

  @Test()
  @TestCase(TheRaven, TheRavenHex)
  public hexToClaimType(work: Work, hex: string) {
    Expect(Serialization.hexToClaim(hex).type).toBe(work.type)
  }

  @Test()
  @TestCase(TheRaven, TheRavenHex)
  public hexToClaimDateCreated(work: Work, hex: string) {
    Expect(Serialization.hexToClaim(hex).dateCreated.getTime()).toBe(work.dateCreated.getTime())
  }
}


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

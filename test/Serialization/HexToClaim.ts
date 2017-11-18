import { Expect, Test, TestCase } from 'alsatian'

import { Serialization } from 'Helpers/Serialization'
import { Work } from 'Interfaces'

import { TheRaven, TheRavenHex } from '../Claims'

export class HexToClaim {

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

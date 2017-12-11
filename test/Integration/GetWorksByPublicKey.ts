import { AsyncTest, Expect, FocusTest, FocusTests, TestCase, TestFixture } from 'alsatian'
import fetch from 'node-fetch'
import { TheRaven } from '../Claims'
import { Claim, isClaim } from '../../src/Interfaces'

const url = 'http://localhost:18080'

@FocusTests
@TestFixture('GET /works?publicKey=...')
export class GetWorksByPublicKey {

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  async getWorksByPublicKeyShouldSucceed(publicKey: string) {
    const response = await fetch(url + '/works/?publicKey=' + publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  async getWorksByPublicKeyShouldReturnAnArray(publicKey: string) {
    const response = await fetch(url + '/works/?publicKey=' + publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()

    Expect(claims).toBeDefined()
    Expect(Array.isArray(claims)).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  async getWorksByPublicKeyShouldReturnOneElement(publicKey: string) {
    const response = await fetch(url + '/works/?publicKey=' + publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()

    Expect(claims.length).toBe(1)
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  async getWorksByPublicKeyShouldReturnClaims(publicKey: string) {
    const response = await fetch(url + '/works/?publicKey=' + publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()
    const allElementsAreClaims = !claims
      .find((claim: Claim) => !isClaim(claim))

    Expect(allElementsAreClaims).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  async getWorksByPublicKeyShouldReturnClaimsMatchingPublicKey(publicKey: string) {
    const response = await fetch(url + '/works/?publicKey=' + publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()
    const allElementsMatchPublicKey = !claims
      .find((claim: Claim) => claim.publicKey !== publicKey)

    Expect(allElementsMatchPublicKey).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey, TheRaven)
  async getWorksByPublicKeyShouldReturnExpectedFields(publicKey: string, expectedClaim: Claim) {
    const response = await fetch(url + '/works/?publicKey=' + publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const json = await response.json()

    const claims: ReadonlyArray<Claim> = json.map((_: any) => ({
      ..._,
      dateCreated: new Date(_.dateCreated)
    }))

    Expect(claims[0].id).toBe(expectedClaim.id)
    Expect(claims[0].publicKey).toBe(expectedClaim.publicKey)
    Expect(claims[0].signature).toBe(expectedClaim.signature)
    Expect(claims[0].dateCreated.toISOString()).toBe(expectedClaim.dateCreated.toISOString())
  }
}

/* tslint:disable:no-relative-imports */
import { AsyncTest, Expect, SetupFixture, TestCase, TestFixture } from 'alsatian'
import { Claim, isClaim, Work } from 'poet-js'

import { AStudyInScarlet, TheMurdersInTheRueMorgue, TheRaven } from '../Claims'
import { Client } from './Helper'

@TestFixture('GET /works?publicKey=...')
export class GetWorksByPublicKey {
  private client: Client

  @SetupFixture
  public setupFixture() {
    this.client = new Client()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  @TestCase(TheMurdersInTheRueMorgue.publicKey)
  @TestCase(AStudyInScarlet.publicKey)
  async getWorksByPublicKeyShouldSucceed(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  @TestCase(TheMurdersInTheRueMorgue.publicKey)
  @TestCase(AStudyInScarlet.publicKey)
  async getWorksByPublicKeyShouldReturnAnArray(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()

    Expect(claims).toBeDefined()
    Expect(Array.isArray(claims)).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  async getWorksByEAPPublicKeyShouldReturnTwoElements(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()

    Expect(claims.length).toBe(2)
  }

  @AsyncTest()
  @TestCase(AStudyInScarlet.publicKey)
  async getWorksByACDPublicKeyShouldReturnOneElement(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()

    Expect(claims.length).toBe(1)
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  @TestCase(TheMurdersInTheRueMorgue.publicKey)
  @TestCase(AStudyInScarlet.publicKey)
  async getWorksByPublicKeyShouldReturnClaims(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()
    const allElementsAreClaims = !claims.find((claim: Claim) => !isClaim(claim))

    Expect(allElementsAreClaims).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey)
  @TestCase(TheMurdersInTheRueMorgue.publicKey)
  @TestCase(AStudyInScarlet.publicKey)
  async getWorksByPublicKeyShouldReturnClaimsMatchingPublicKey(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims = await response.json()
    const allElementsMatchPublicKey = !claims.find((claim: Claim) => claim.publicKey !== publicKey)

    Expect(allElementsMatchPublicKey).toBeTruthy()
  }

  @AsyncTest()
  @TestCase(TheRaven.publicKey, [TheRaven, TheMurdersInTheRueMorgue])
  @TestCase(AStudyInScarlet.publicKey, [AStudyInScarlet])
  async getWorksByPublicKeyShouldReturnExpectedFields(publicKey: string, expectedClaims: ReadonlyArray<Work>) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const json = await response.json()

    const claims: ReadonlyArray<Claim> = json.map((_: any) => ({
      ..._,
      dateCreated: new Date(_.dateCreated),
    }))

    for (let i = 0; i < claims.length; i++) {
      Expect(claims[i].id).toBe(expectedClaims[i].id)
      Expect(claims[i].publicKey).toBe(expectedClaims[i].publicKey)
      Expect(claims[i].signature).toBe(expectedClaims[i].signature)
      Expect(claims[i].dateCreated.toISOString()).toBe(expectedClaims[i].dateCreated.toISOString())
    }
  }
}

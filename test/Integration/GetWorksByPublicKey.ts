/* tslint:disable:no-relative-imports */
import { Claim, isClaim, Work } from '@po.et/poet-js'
import { AsyncTest, Expect, SetupFixture, TestCase, TestFixture } from 'alsatian'
import { pipe, not } from 'ramda'

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
    const allElementsAreClaims = !claims.find(
      pipe(
        isClaim,
        not
      )
    )

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
  @TestCase(TheRaven.publicKey, [TheMurdersInTheRueMorgue, TheRaven])
  @TestCase(AStudyInScarlet.publicKey, [AStudyInScarlet])
  async getWorksByPublicKeyShouldReturnExpectedFields(publicKey: string, expectedClaims: ReadonlyArray<Work>) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const claims: ReadonlyArray<Claim> = await response.json()

    for (let i = 0; i < claims.length; i++) {
      Expect(claims[i].id).toBe(expectedClaims[i].id)
      Expect(claims[i].publicKey).toBe(expectedClaims[i].publicKey)
      Expect(claims[i].signature).toBe(expectedClaims[i].signature)
      Expect(claims[i].created).toBe(expectedClaims[i].created)
    }
  }

  @AsyncTest()
  @TestCase('')
  async getWorksShouldFailWith422WhenPassingAnInvalidArgument(publicKey: string) {
    const response = await this.client.getWorksByPublicKey(publicKey)

    Expect(response.status).toBe(422)
  }
}

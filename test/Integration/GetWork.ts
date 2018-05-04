/* tslint:disable:no-relative-imports */
import {
  AsyncTest,
  Expect,
  SetupFixture,
  TestCase,
  TestFixture
} from 'alsatian'
import { Claim } from 'poet-js'

import { AStudyInScarlet, TheMurdersInTheRueMorgue, TheRaven } from '../Claims'
import { Client } from './Helper'

@TestFixture('GET /works/:id')
export class GetWork {
  private client: Client

  @SetupFixture
  public setupFixture() {
    this.client = new Client()
  }

  @AsyncTest()
  @TestCase(TheRaven)
  @TestCase(TheMurdersInTheRueMorgue)
  @TestCase(AStudyInScarlet)
  async getWork200(claim: Claim) {
    const response = await this.client.getWork(claim.id)

    Expect(response.status).toBe(200)
    Expect(response.ok).toBeTruthy()

    const body = await response.json()

    Expect(body.id).toBe(claim.id)
    Expect(body.attributes.name).toBe(claim.attributes.name)
  }

  @AsyncTest()
  @TestCase('1234')
  async getWork404(id: string) {
    const response = await this.client.getWork(id)

    Expect(response.status).toBe(404)
    Expect(response.ok).not.toBeTruthy()

    const body = await response.text()

    Expect(body).toBe('')
  }
}

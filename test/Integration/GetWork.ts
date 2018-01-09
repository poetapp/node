import { AsyncTest, Expect, TestCase } from 'alsatian'
import fetch from 'node-fetch'
import { Claim } from 'poet-js'

import { AStudyInScarlet, TheMurdersInTheRueMorgue, TheRaven } from '../Claims'

const url = 'http://localhost:18080'

export class GetWork {

  @AsyncTest()
  @TestCase(TheRaven)
  @TestCase(TheMurdersInTheRueMorgue)
  @TestCase(AStudyInScarlet)
  async getWork200(claim: Claim) {
    const response = await fetch(url + '/works/' + claim.id)

    Expect(response.ok).toBeTruthy()

    const body = await response.json()

    Expect(body.id).toBe(claim.id)
    Expect(body.attributes.name).toBe(claim.attributes.name)

  }

  @AsyncTest()
  @TestCase('1234')
  async getWork404(id: string) {
    const response = await fetch(url + '/works/' + id)

    Expect(response.status).toBe(404)
    Expect(response.ok).not.toBeTruthy()

    const body = await response.text()

    Expect(body).toBe('')

  }
}

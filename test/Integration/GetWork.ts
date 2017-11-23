import { AsyncTest, Expect, FocusTests, TestCase } from 'alsatian'
import fetch from 'node-fetch'

const url = 'http://localhost:18080'

export class GetWork {

  @AsyncTest()
  @TestCase('10d61d594df81c8018604e2bb0cb1e798ce18675812445e0248db4819e558187')
  async getWork200(id: string) {
    const response = await fetch(url + '/works/' + id)

    Expect(response.ok).toBeTruthy()

    const body = await response.json()

    Expect(body.id).toBe(id)
    Expect(body.attributes.name).toBe('The Raven')

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

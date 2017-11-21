import { AsyncTest, Expect, FocusTests, TestCase } from 'alsatian'
import fetch from 'node-fetch'

const url = 'http://localhost:8080'

export class GetWork {

  @AsyncTest()
  @TestCase('123')
  async getWork200(id: string) {
    const response = await fetch(url + '/works/' + id)

    Expect(response.ok).toBeTruthy()

    const body = await response.json()

    Expect(body.id).toBe(id)
    Expect(body.name).toBe('some name')

  }

  @AsyncTest()
  @TestCase('1234')
  async getWork404(id: string) {
    const response = await fetch(url + '/works/' + id)

    Expect(response.status).toBe(404)
    Expect(response.ok).not.toBeTruthy()

    const body = await response.text()

    Expect(body).toBe('Not Found')

  }
}

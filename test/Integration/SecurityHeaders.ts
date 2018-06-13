import { AsyncTest, Expect, TestCase, TestFixture, SetupFixture } from 'alsatian'
import fetch from 'node-fetch'
import { Client } from './Helper'

@TestFixture('Security Headers')
export class SetOfTests {
  private client: Client

  @SetupFixture
  public setupFixture() {
    this.client = new Client()
  }

  @AsyncTest()
  @TestCase('content-security-policy', `script-src 'self'`)
  @TestCase('x-frame-options', 'DENY')
  @TestCase('x-xss-protection', '1; mode=block')
  @TestCase('x-content-type-options', 'nosniff')
  @TestCase('referrer-policy', 'same-origin')
  async getHeader(value: string, expected: string) {
    const result = await fetch(this.client.url)
    const header = result.headers.get(value)
    Expect(header).toBe(expected)
  }
}

/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'
import { values } from 'ramda'
import { describe } from 'riteway'

import { Client } from '../helpers/Helper'

describe('Security Headers', async assert => {
  const client = new Client()
  const response = await fetch(client.url)

  const headers = {
    'x-content-security-policy': "script-src 'self'",
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'same-origin',
  }

  const actual = await Promise.all(
    Object.keys(headers).map(async (header: string) => await response.headers.get(header))
  )

  const expected = values(headers)

  assert({
    given: 'a call to the node url',
    should: 'return all of the appropriate headers',
    actual,
    expected,
  })
})

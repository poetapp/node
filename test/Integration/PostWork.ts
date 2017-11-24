import { AsyncTest, Expect, FocusTests, TestCase } from 'alsatian'
import fetch from 'node-fetch'
import { promisify } from 'util'

import { createClaim } from 'Helpers/Claim'
import { ClaimType } from 'Interfaces'

import { Key1 } from '../Keys'

const url = 'http://localhost:18080'

const delay = promisify(setTimeout)

export class PostWork {

  @AsyncTest()
  async correct() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    const postResponse = await fetch(url + '/works/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(claim)
    })

    Expect(postResponse.ok).toBeTruthy()
    Expect(postResponse.status).toBe(202)

    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe('')

    // Give the Node 300ms for the messages to be passed around and responded internally.
    // Not particularly deterministic, but we can expect something to be wrong if integration
    // tests cause such big delays.

    await delay(300)

    const response = await fetch(url + '/works/' + claim.id)

    Expect(response.ok).toBeTruthy()

    const body = await response.json()

    Expect(body.id).toBe(claim.id)

    Expect(body.ipfsHash).toBeDefined()
    Expect(body.ipfsHash.length).toBeDefined()
    Expect(body.ipfsHash.length).toBe(46)

    Expect(body.attributes.name).toBe(claim.attributes.name)

  }

  @AsyncTest()
  async wrongSignature() {

    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    const postResponse = await fetch(url + '/works/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...claim,
        signature: '123'
      })
    })

    Expect(postResponse.ok).not.toBeTruthy()
    Expect(postResponse.status).toBe(422)

    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe('Claim\'s signature is incorrect.')

  }

}

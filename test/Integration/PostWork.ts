import { AsyncTest, Expect, FocusTests, TestCase } from 'alsatian'
import fetch from 'node-fetch'

import { createClaim } from 'Helpers/Claim'
import { ClaimType } from 'Interfaces'

import { Key1 } from '../Keys'

const url = 'http://localhost:8080'

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

    const response = await fetch(url + '/works/' + claim.id)

    Expect(response.ok).toBeTruthy()

    const body = await response.json()

    Expect(body.id).toBe(claim.id)
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

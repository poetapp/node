import { AsyncTest, Expect } from 'alsatian'
import fetch from 'node-fetch'
import { promisify } from 'util'

import { createClaim } from 'Helpers/Claim'
import { Claim, ClaimType } from 'Interfaces'

import { Key1 } from '../Keys'

const url = 'http://localhost:18080'

const delay = promisify(setTimeout)

function postWork(claim: Claim) {
  return fetch(url + '/works/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(claim)
  })
}

export class PostWork {

  @AsyncTest()
  async postWorkShouldSucceedWith202() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    const postResponse = await postWork(claim)

    Expect(postResponse.ok).toBeTruthy()
    Expect(postResponse.status).toBe(202)
  }

  @AsyncTest()
  async postWorkShouldSucceedWithEmptyResponse() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    const postResponse = await postWork(claim)
    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe('')
  }

  @AsyncTest()
  async shouldBeAbleToGetPostedWork() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

    // Give the Node 300ms for the messages to be passed around and responded internally.
    // Not particularly deterministic, but we can expect something to be wrong if integration
    // tests cause such big delays.

    await delay(300)

    const response = await fetch(url + '/works/' + claim.id)

    Expect(response.ok).toBeTruthy()
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveTheSameId() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

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
  async gettingThePostedWorkShouldRetrieveTheSameAttributes() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

    // Give the Node 300ms for the messages to be passed around and responded internally.
    // Not particularly deterministic, but we can expect something to be wrong if integration
    // tests cause such big delays.

    await delay(300)

    const response = await fetch(url + '/works/' + claim.id)
    const body = await response.json()

    Expect(body.attributes.name).toBe(claim.attributes.name)
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveIPFSHash() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

    // Give the Node 300ms for the messages to be passed around and responded internally.
    // Not particularly deterministic, but we can expect something to be wrong if integration
    // tests cause such big delays.

    await delay(300)

    const response = await fetch(url + '/works/' + claim.id)
    const body = await response.json()

    Expect(body.ipfsHash).toBeDefined()
    Expect(body.ipfsHash.length).toBeDefined()
    Expect(body.ipfsHash.length).toBe(46)
  }

  @AsyncTest()
  async shouldFailIfSignatureIsIncorrect() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    const postResponse = await postWork({
      ...claim,
      signature: '123'
    })

    Expect(postResponse.ok).not.toBeTruthy()
    Expect(postResponse.status).toBe(422)

    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe('Claim\'s signature is incorrect.')
  }

}

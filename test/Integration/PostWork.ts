import { AsyncTest, Expect } from 'alsatian'
import fetch from 'node-fetch'
import { Claim, ClaimType, createClaim } from 'poet-js'
import { promisify } from 'util'

import { Key1 } from '../Keys'

const delay = promisify(setTimeout)

const url = 'http://localhost:18080'

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

    await waitForNode()

    const response = await getWork(claim.id)

    Expect(response.ok).toBeTruthy()
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveTheSameId() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

    await waitForNode()

    const response = await getWork(claim.id)

    const body = await response.json()

    Expect(body.id).toBe(claim.id)
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveTheSameAttributes() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

    await waitForNode()

    const response = await getWork(claim.id)
    const body = await response.json()

    Expect(body.attributes.name).toBe(claim.attributes.name)
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveIPFSHash() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name'
    })

    await postWork(claim)

    await waitForNode()

    const response = await getWork(claim.id)
    const body = await response.json()

    Expect(body.timestamp).toBeDefined()
    Expect(body.timestamp.ipfsHash).toBeDefined()
    Expect(body.timestamp.ipfsHash.length).toBeDefined()
    Expect(body.timestamp.ipfsHash.length).toBe(46)
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

function getWork(id: string) {
  return fetch(url + '/works/' + id)
}

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

/**
 *  Give the Node 300ms for the messages to be passed around and responded internally.
 *  Not particularly deterministic, but we can expect something to be wrong if integration
 *  tests cause such big delays.
 */
function waitForNode() {
  return delay(300)
}

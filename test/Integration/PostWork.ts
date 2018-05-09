/* tslint:disable:no-relative-imports */
import { AsyncTest, Expect, SetupFixture, TestFixture } from 'alsatian'
import { ClaimType, createClaim } from 'poet-js'

import { Key1 } from '../Keys'
import { Client, waitForNode } from './Helper'

@TestFixture('POST /works')
export class PostWork {
  private client: Client

  @SetupFixture
  public setupFixture() {
    this.client = new Client()
  }

  @AsyncTest()
  async postWorkShouldSucceedWith202() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    const postResponse = await this.client.postWork(claim)

    Expect(postResponse.ok).toBeTruthy()
    Expect(postResponse.status).toBe(202)
  }

  @AsyncTest()
  async postWorkShouldSucceedWithEmptyResponse() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    const postResponse = await this.client.postWork(claim)
    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe('')
  }

  @AsyncTest()
  async shouldBeAbleToGetPostedWork() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)

    Expect(response.ok).toBeTruthy()
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveTheSameId() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)

    const body = await response.json()

    Expect(body.id).toBe(claim.id)
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveTheSameAttributes() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)
    const body = await response.json()

    Expect(body.attributes.name).toBe(claim.attributes.name)
  }

  @AsyncTest()
  async gettingThePostedWorkShouldRetrieveIPFSHash() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)
    const body = await response.json()

    Expect(body.timestamp).toBeDefined()
    Expect(body.timestamp.ipfsHash).toBeDefined()
    Expect(body.timestamp.ipfsHash.length).toBeDefined()
    Expect(body.timestamp.ipfsHash.length).toBe(46)
  }

  @AsyncTest()
  async shouldFailIfSignatureIsIncorrect() {
    const claim = createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    const postResponse = await this.client.postWork({
      ...claim,
      signature: '123',
    })

    Expect(postResponse.ok).not.toBeTruthy()
    Expect(postResponse.status).toBe(422)

    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe("Claim's signature is incorrect.")
  }
}

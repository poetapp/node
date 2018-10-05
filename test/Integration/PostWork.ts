/* tslint:disable:no-relative-imports */
import { ClaimType, createClaim } from '@po.et/poet-js'
import { AsyncTest, Expect, SetupFixture, TestFixture, Timeout } from 'alsatian'

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
    const claim = await createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    const postResponse = await this.client.postWork(claim)

    Expect(postResponse.ok).toBeTruthy()
    Expect(postResponse.status).toBe(202)
  }

  @AsyncTest()
  async postWorkShouldSucceedWithEmptyResponse() {
    const claim = await createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    const postResponse = await this.client.postWork(claim)
    const postResponseBody = await postResponse.text()

    Expect(postResponseBody).toBe('')
  }

  @AsyncTest()
  @Timeout(1500)
  async shouldBeAbleToGetPostedWork() {
    const claim = await createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)

    Expect(response.ok).toBeTruthy()
  }

  @AsyncTest()
  @Timeout(1500)
  async gettingThePostedWorkShouldRetrieveTheSameId() {
    const claim = await createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)

    const body = await response.json()

    Expect(body.id).toBe(claim.id)
  }

  @AsyncTest()
  @Timeout(1500)
  async gettingThePostedWorkShouldRetrieveTheSameAttributes() {
    const claim = await createClaim(Key1.privateKey, ClaimType.Work, {
      name: 'Name',
    })

    await this.client.postWork(claim)

    await waitForNode()

    const response = await this.client.getWork(claim.id)
    const body = await response.json()

    Expect(body.attributes.name).toBe(claim.attributes.name)
  }

  @AsyncTest()
  async shouldFailIfSignatureIsIncorrect() {
    const claim = await createClaim(Key1.privateKey, ClaimType.Work, {
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

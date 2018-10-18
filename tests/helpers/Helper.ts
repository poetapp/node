import { Claim } from '@po.et/poet-js'
import fetch from 'node-fetch'
import { promisify } from 'util'

const delay = promisify(setTimeout)
const TEST_URL = process.env.INTEGRATION_TEST_NODE_URL || 'http://localhost:18080'

export class Client {
  readonly url: string

  constructor(url: string = TEST_URL) {
    this.url = url
  }

  getWork(id: string) {
    return fetch(this.url + '/works/' + id)
  }

  getWorks() {
    return fetch(this.url + '/works/')
  }

  getOffsetPublicKeyWorks(offset: string, publicKey: string) {
    return fetch(this.url + `/works/?offset=${offset}&publicKey=${publicKey}`)
  }

  getLimitedWorks(limit: string) {
    return fetch(this.url + `/works/?limit=${limit}`)
  }

  getWorksTest(test?: string) {
    return fetch(this.url + '/works/?test=' + test)
  }

  getWorksByPublicKey(publicKey: string) {
    return fetch(this.url + '/works/?publicKey=' + publicKey)
  }

  postWork(claim: Claim) {
    return fetch(this.url + '/works/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claim),
    })
  }
}

/**
 *  Give the Node 300ms for the messages to be passed around and responded internally.
 *  Not particularly deterministic, but we can expect something to be wrong if integration
 *  tests cause such big delays.
 */
export function waitForNode() {
  return delay(1300)
}

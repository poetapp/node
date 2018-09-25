import { Claim, ClaimType, createClaim, isValidClaim } from '@po.et/poet-js'
import fetch from 'node-fetch'
import { path } from 'ramda'
import { describe } from 'riteway'
const Client = require('bitcoin-core')

const bitcoindClientA = new Client({
  host: process.env.BITCOIN_URL,
  port: 18443,
  network: 'regtest',
  password: 'bitcoinrpcpassword',
  username: 'bitcoinrpcuser',
})

const privateKey = 'L1mptZyB6aWkiJU7dvAK4UUjLSaqzcRNYJn3KuAA7oEVyiNn3ZPF'
const fullUrl = (host: string = 'http://MISSING_HOST:PORT') => (rest: any) => `${host}${rest}`

const postWork = (host: string, claim: Claim) => {
  return fetch(fullUrl(host)('/works/'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claim),
  })
}

const ensureBitcoinBalance = async (client: any) => {
  const balance = await client.getBalance()
  if (balance === 0) await client.generate(101)
}

const getWork = (host: string) => (id: string) => fetch(fullUrl(host)(`/works/${id}`))
const getWorkFromPoetNodeA = getWork(process.env.INTEGRATION_TEST_NODE_URL)

const pause = (interval: number) => new Promise((res, rej) => setTimeout(() => res(), interval * 1000 * 2))

describe('submit a claim to a poet node and observe results', async (should: any) => {
  const { assert } = should('')
  const text = 'most excellent read...'

  // Make sure there are coins to pay for transactions.
  await ensureBitcoinBalance(bitcoindClientA)

  // Create a claim.

  const claim = await createClaim(privateKey, ClaimType.Work, {
    name: 'Author Name',
    text,
  })

  {
    const actual = await isValidClaim(claim)

    assert({
      given: 'a newly created claim',
      should: 'be a valid claim',
      actual,
      expected: true,
    })
  }

  // Submit a claim.

  const actual = await postWork(process.env.INTEGRATION_TEST_NODE_URL, claim)

  assert({
    given: 'a claim submission to a poet node',
    should: 'be accepted',
    actual: actual.ok,
    expected: true,
  })

  // Wait for a claim batch to be submitted to the blockchain.
  await pause(parseInt(process.env.TIMESTAMP_INTERVAL_IN_SECONDS, 10))

  // mine N confirmation blocks.
  await bitcoindClientA.generate(1)

  // Wait for claim batches to be read from the blockchain.
  await pause(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS, 10))

  // Retrieve the claim.
  const responseA = await getWorkFromPoetNodeA(claim.id)
  const claimDataA = await responseA.json()

  assert({
    given: 'a claim retrieved by id from poet node A',
    should: 'have an ipfsFileHash property as a string',
    actual: typeof path(['timestamp', 'ipfsFileHash'], claimDataA),
    expected: 'string',
  })

  assert({
    given: 'a claim retrieved by id from poet node A',
    should: 'have an ipfsDirectoryHash property as a string',
    actual: typeof path(['timestamp', 'ipfsDirectoryHash'], claimDataA),
    expected: 'string',
  })

  assert({
    given: 'a claim retrieved by id from poet node A',
    should: 'have a blockHeight property as a number',
    actual: typeof path(['timestamp', 'blockHeight'], claimDataA),
    expected: 'number',
  })

  assert({
    given: 'a claim retrieved by id from poet node A',
    should: 'have a blockHash property as a string',
    actual: typeof path(['timestamp', 'blockHash'], claimDataA),
    expected: 'string',
  })

  assert({
    given: 'a claim retrieved by id from poet node A',
    should: 'have a transactionId property as a string',
    actual: typeof path(['timestamp', 'transactionId'], claimDataA),
    expected: 'string',
  })
})

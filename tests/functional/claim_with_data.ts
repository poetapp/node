/* tslint:disable:no-relative-imports */
import { ClaimType, createClaim, isValidClaim } from '@po.et/poet-js'
import { path } from 'ramda'
import { describe } from 'riteway'
import { app } from '../../src/app'
import { ensureBitcoinBalance } from '../helpers/bitcoin'
import { delay, runtimeId } from '../helpers/utils'
import { getWork, postWork } from '../helpers/works'
const Client = require('bitcoin-core')

const NODE_A_PORT = '28081'
const NODE_B_PORT = '28082'
const privateKey = 'L1mptZyB6aWkiJU7dvAK4UUjLSaqzcRNYJn3KuAA7oEVyiNn3ZPF'
const getWorkFromNodeA = getWork(NODE_A_PORT)
const postWorkToNodeA = postWork(NODE_A_PORT)
const getWorkFromNodeB = getWork(NODE_B_PORT)

const bitcoindClientA = new Client({
  host: process.env.BITCOIN_URL || 'bitcoind-1',
  port: 18443,
  network: 'regtest',
  password: 'bitcoinrpcpassword',
  username: 'bitcoinrpcuser',
})

describe('A user can successfully submit a claim into the po.et network', async (should: any) => {
  const { assert } = should('')
  const text = 'A most excellent read...'

  const serverA = await app({
    BITCOIN_URL: process.env.BITCOIN_URL || 'bitcoind-1',
    API_PORT: NODE_A_PORT,
    MONGODB_DATABASE: `test-functional-nodeA-poet-${runtimeId()}`,
    MONGODB_HOST: 'mongo',
    MINIMUM_BLOCK_HEIGHT: 100,
    ENABLE_TIMESTAMPING: true,
    TIMESTAMP_INTERVAL_IN_SECONDS: 10,
    BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
    READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
    EXCHANGE_PREFIX: `test-functional-nodeA-poet-${runtimeId()}`,
  })

  const serverB = await app({
    BITCOIN_URL: process.env.BITCOIN_B_URL || 'bitcoind-2',
    API_PORT: NODE_B_PORT,
    MONGODB_DATABASE: `test-functional-nodeB-poet-${runtimeId()}`,
    MONGODB_HOST: 'mongo',
    MINIMUM_BLOCK_HEIGHT: 100,
    ENABLE_TIMESTAMPING: true,
    TIMESTAMP_INTERVAL_IN_SECONDS: 10,
    BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
    READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
    EXCHANGE_PREFIX: `test-functional-nodeB-poet-${runtimeId()}`,
  })

  // Make sure node A has regtest coins to pay for transactions.
  await ensureBitcoinBalance(bitcoindClientA)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  // Create a claim.

  const claim = await createClaim(privateKey, ClaimType.Work, {
    name: 'Author Name',
    text,
  })

  assert({
    given: 'a newly created claim',
    should: 'be valid',
    actual: await isValidClaim(claim),
    expected: true,
  })

  {
    // Submit a claim.

    const actual = await postWorkToNodeA(claim)

    assert({
      given: 'a claim submission to a po.et node',
      should: 'be accepted',
      actual: actual.ok,
      expected: true,
    })
  }

  // Wait for a claim batch to be submitted to the blockchain.
  await delay(parseInt(process.env.TIMESTAMP_INTERVAL_IN_SECONDS || '10', 10) * 1000 * 2)

  // mine N confirmation blocks on bitcoindA.
  await bitcoindClientA.generate(parseInt(process.env.CONFIRMATION_BLOCKS || '1', 10))

  // Wait for claim batches to be read from the blockchain.
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 2)

  {
    // Retrieve the claim from the same po.et node it was submitted to.

    let claimDataA

    try {
      const responseA = await getWorkFromNodeA(claim.id)
      claimDataA = await responseA.json()
    } catch (err) {
      claimDataA = { timestamp: {} }
    }
    const { ipfsFileHash, ipfsDirectoryHash, blockHeight, blockHash, transactionId } = path(['timestamp'], claimDataA)

    assert({
      given: 'a claim retrieved by id from po.et node A',
      should: 'have an ipfsFileHash property of type string',
      actual: typeof ipfsFileHash,
      expected: 'string',
    })

    assert({
      given: 'a claim retrieved by id from po.et node A',
      should: 'have an ipfsDirectoryHash property of type string',
      actual: typeof ipfsDirectoryHash,
      expected: 'string',
    })

    assert({
      given: 'a claim retrieved by id from po.et node A',
      should: 'have a blockHeight property of type number',
      actual: typeof blockHeight,
      expected: 'number',
    })

    assert({
      given: 'a claim retrieved by id from po.et node A',
      should: 'have a blockHash property of type string',
      actual: typeof blockHash,
      expected: 'string',
    })

    assert({
      given: 'a claim retrieved by id from po.et node A',
      should: 'have a transactionId property of type string',
      actual: typeof transactionId,
      expected: 'string',
    })
  }

  // Wait for claim batches to be read from the blockchain on po.et node B.
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 2)

  {
    let claimDataB

    try {
      const responseB = await getWorkFromNodeB(claim.id)
      claimDataB = await responseB.json()
    } catch (err) {
      claimDataB = { timestamp: {} }
    }
    const { ipfsFileHash, ipfsDirectoryHash, blockHeight, blockHash, transactionId } = path(['timestamp'], claimDataB)

    assert({
      given: 'a claim retrieved by id from po.et node B',
      should: 'have an ipfsFileHash property of type string',
      actual: typeof ipfsFileHash,
      expected: 'string',
    })

    assert({
      given: 'a claim retrieved by id from po.et node B',
      should: 'have an ipfsDirectoryHash property of type string',
      actual: typeof ipfsDirectoryHash,
      expected: 'string',
    })

    assert({
      given: 'a claim retrieved by id from po.et node B',
      should: 'have a blockHeight property of type number',
      actual: typeof blockHeight,
      expected: 'number',
    })

    assert({
      given: 'a claim retrieved by id from po.et node B',
      should: 'have a blockHash property of type string',
      actual: typeof blockHash,
      expected: 'string',
    })

    assert({
      given: 'a claim retrieved by id from po.et node B',
      should: 'have a transactionId property of type string',
      actual: typeof transactionId,
      expected: 'string',
    })
  }

  await serverA.stop()
  await serverB.stop()
})

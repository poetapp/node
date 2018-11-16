/* tslint:disable:no-relative-imports */
import { configureCreateVerifiableClaim, getVerifiableClaimSigner, isSignedVerifiableClaim } from '@po.et/poet-js'
import { path, pipeP } from 'ramda'
import { describe } from 'riteway'

import { app } from '../../src/app'
import { issuer, privateKey } from '../helpers/Keys'
import { ensureBitcoinBalance, bitcoindClients, resetBitcoinServers } from '../helpers/bitcoin'
import { delay, runtimeId, createDatabase } from '../helpers/utils'
import { getWork, postWork } from '../helpers/works'

const PREFIX_A = `test-functional-nodeA-poet-${runtimeId()}`
const NODE_A_PORT = '28081'
const PREFIX_B = `test-functional-nodeB-poet-${runtimeId()}`
const NODE_B_PORT = '28082'
const getWorkFromNodeA = getWork(NODE_A_PORT)
const postWorkToNodeA = postWork(NODE_A_PORT)
const getWorkFromNodeB = getWork(NODE_B_PORT)

const blockchainSettings = {
  MINIMUM_BLOCK_HEIGHT: 100,
  ENABLE_ANCHORING: true,
  ANCHOR_INTERVAL_IN_SECONDS: 10,
  BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
  READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
  UPLOAD_CLAIM_INTERVAL_IN_SECONDS: 5,
}

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()
const createVerifiableClaim = configureCreateVerifiableClaim({ issuer })
const signVerifiableClaim = configureSignVerifiableClaim({ privateKey })
const createClaim = pipeP(
  createVerifiableClaim,
  signVerifiableClaim,
)

const { btcdClientA, btcdClientB }: any = bitcoindClients()

describe('A user can successfully submit a claim into the po.et network', async (assert: any) => {
  await resetBitcoinServers()
  await btcdClientB.addNode(btcdClientA.host, 'add')
  await delay(5 * 1000)

  const dbA = await createDatabase(PREFIX_A)
  const serverA = await app({
    BITCOIN_URL: btcdClientA.host,
    API_PORT: NODE_A_PORT,
    MONGODB_DATABASE: dbA.settings.tempDbName,
    MONGODB_USER: dbA.settings.tempDbUser,
    MONGODB_PASSWORD: dbA.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX_A,
    ...blockchainSettings,
  })

  const dbB = await createDatabase(PREFIX_B)
  const serverB = await app({
    BITCOIN_URL: btcdClientB.host,
    API_PORT: NODE_B_PORT,
    MONGODB_DATABASE: dbB.settings.tempDbName,
    MONGODB_USER: dbB.settings.tempDbUser,
    MONGODB_PASSWORD: dbB.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX_B,
    ...blockchainSettings,
  })

  // Make sure node A has regtest coins to pay for transactions.
  await ensureBitcoinBalance(btcdClientA)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  // Create a claim.

  const claim = await createClaim({
    name: 'Author Name',
  })

  // This is a test of what? Seems like just poetjs
  assert({
    given: 'a newly created claim',
    should: 'be valid',
    actual: await isSignedVerifiableClaim(claim),
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
  await delay(parseInt(process.env.ANCHOR_INTERVAL_IN_SECONDS || '10', 10) * 1000 * 2)

  // mine N confirmation blocks on bitcoindA.
  await btcdClientA.generate(parseInt(process.env.CONFIRMATION_BLOCKS || '1', 10))

  // Wait for claim batches to be read from the blockchain.
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 3)

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
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 3)

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
  await dbA.teardown()
  await dbB.teardown()
})

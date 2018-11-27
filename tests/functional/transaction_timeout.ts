/* tslint:disable:no-relative-imports */
import { configureCreateVerifiableClaim, getVerifiableClaimSigner, isSignedVerifiableClaim } from '@po.et/poet-js'
import { allPass, is, isNil, lensPath, not, path, pipe, pipeP, view } from 'ramda'
import { describe } from 'riteway'

import { app } from '../../src/app'
import { issuer, privateKey } from '../helpers/Keys'
import { ensureBitcoinBalance, bitcoindClients, resetBitcoinServers } from '../helpers/bitcoin'
import { delay, runtimeId, createDatabase } from '../helpers/utils'
import { getWork, postWork } from '../helpers/works'

const PREFIX = `test-functional-nodeA-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWork(NODE_PORT)

const blockchainSettings = {
  MINIMUM_BLOCK_HEIGHT: 100,
  ENABLE_ANCHORING: true,
  ANCHOR_INTERVAL_IN_SECONDS: 10,
  BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
  READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
  UPLOAD_CLAIM_INTERVAL_IN_SECONDS: 5,
  MAXIMUM_TRANSACTION_AGE_IN_BLOCKS: 1,
  PURGE_STALE_TRANSACTIONS_INTERVAL_IN_SECONDS: 15,
}

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()
const createVerifiableClaim = configureCreateVerifiableClaim({ issuer })
const signVerifiableClaim = configureSignVerifiableClaim({ privateKey })
const createClaim = pipeP(
  createVerifiableClaim,
  signVerifiableClaim,
)

const { btcdClientA, btcdClientB }: any = bitcoindClients()

const blockHash = lensPath(['anchor', 'blockHash'])
const blockHeight = lensPath(['anchor', 'blockHeight'])
const transactionId = lensPath(['anchor', 'transactionId'])

const getTransactionId = view(transactionId)
const getBlockHash = view(blockHash)
const getBlockHeight = view(blockHeight)
const isNotNil = pipe(isNil, not)

const lengthIsGreaterThan0 = (s: string) => s.length > 0
const hasValidTxId = allPass([is(String), lengthIsGreaterThan0])

describe('Transaction timout will reset the transaction id for the claim', async assert => {
  await resetBitcoinServers()
  await btcdClientB.addNode(btcdClientA.host, 'add')
  await delay(5 * 1000)

  const db = await createDatabase(PREFIX)
  const server = await app({
    BITCOIN_URL: btcdClientA.host,
    API_PORT: NODE_PORT,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX,
    ...blockchainSettings,
  })

  // Make sure node A has regtest coins to pay for transactions.
  await ensureBitcoinBalance(btcdClientA)
  // await ensureBitcoinBalance(btcdClientB)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  const claim = await createClaim({
    name: 'Author Name',
  })

  await postWorkToNode(claim)

  // Wait for a claim batch to be submitted to the blockchain.
  await delay((blockchainSettings.ANCHOR_INTERVAL_IN_SECONDS +
    blockchainSettings.BATCH_CREATION_INTERVAL_IN_SECONDS + 5) * 1000)

  const firstResponse = await getWorkFromNode(claim.id)
  const firstGet = await firstResponse.json()
  const firstTxId = getTransactionId(firstGet)

  assert({
    given: 'a newly created claim',
    should: 'have a transaction id',
    actual: hasValidTxId(firstTxId),
    expected: true,
  })

  assert({
    given: 'a newly created claim',
    should: 'NOT have a blockHash',
    actual: isNil(getBlockHash(firstGet)),
    expected: true,
  })

  assert({
    given: 'a newly created claim',
    should: 'NOT have a blockHeight',
    actual: isNil(getBlockHeight(firstGet)),
    expected: true,
  })

  await btcdClientB.generate(blockchainSettings.MAXIMUM_TRANSACTION_AGE_IN_BLOCKS + 1)

  await delay((blockchainSettings.PURGE_STALE_TRANSACTIONS_INTERVAL_IN_SECONDS  + 5) * 1000)
  await delay((blockchainSettings.ANCHOR_INTERVAL_IN_SECONDS +
    blockchainSettings.BATCH_CREATION_INTERVAL_IN_SECONDS + 5) * 1000)

  const secondResponse = await getWorkFromNode(claim.id)
  const secondGet = await secondResponse.json()
  const secondTxId = getTransactionId(secondGet)

  assert({
    given: 'transaction age max reached',
    should: 'create a valid transaction id for the claim',
    actual: hasValidTxId(secondTxId),
    expected: true,
  })

  assert({
    given: 'transaction age max reached',
    should: 'create a new transaction id for the claim',
    actual: secondTxId !== firstTxId,
    expected: true,
  })

  await btcdClientA.generate(blockchainSettings.MAXIMUM_TRANSACTION_AGE_IN_BLOCKS + 1)
  await delay((
    blockchainSettings.BATCH_CREATION_INTERVAL_IN_SECONDS +
    blockchainSettings.READ_DIRECTORY_INTERVAL_IN_SECONDS
  ) * 1000)

  const thirdResponse = await getWorkFromNode(claim.id)
  const thirdGet = await thirdResponse.json()
  const thirdTxId = getTransactionId(thirdGet)

  assert({
    given: 'transaction mined',
    should: 'store the block height with the claim',
    actual: isNotNil(getBlockHeight(thirdGet)),
    expected: true,
  })

  assert({
    given: 'transaction mined',
    should: 'store the block hash with the claim',
    actual: isNotNil(getBlockHash(thirdGet)),
    expected: true,
  })

  await delay((blockchainSettings.PURGE_STALE_TRANSACTIONS_INTERVAL_IN_SECONDS + 5) * 1000)

  const fourthResponse = await getWorkFromNode(claim.id)
  const fourthGet = await fourthResponse.json()
  const fourthTxId = getTransactionId(fourthGet)

  assert({
    given: 'a claim with a block height and hash',
    should: 'have the same transaction id',
    actual: fourthTxId,
    expected: thirdTxId,
  })

  await server.stop()
  await db.teardown()
})

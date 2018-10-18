/* tslint:disable:no-relative-imports */
import { isClaim, Claim } from '@po.et/poet-js'
import { all, pickBy, pluck, uniq } from 'ramda'
import { describe } from 'riteway'
const Client = require('bitcoin-core')

import { app } from '../../../src/app'
import {
  ABraveAndStartlingTruth,
  AllGodsChildrenNeedTravelingShoes,
  ASongFlungUpToHeaven,
  AStudyInScarlet,
  GatherTogetherInMyName,
  KnowWhyTheCagedBirdSings,
  MomAndMeAndMom,
  OnThePulseOfMorning,
  SinginAndSwinginAndGettingMerryLikeChristmas,
  TheHeartOfAWoman,
  TheMurdersInTheRueMorgue,
  TheRaven,
  TheWeekOfDiana,
} from '../../helpers/Claims'

import { ensureBitcoinBalance } from '../../helpers/bitcoin'
import { delay, runtimeId, createDatabase } from '../../helpers/utils'
import { getWork, postWork } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWork(NODE_PORT)

const works = [
  ABraveAndStartlingTruth,
  AllGodsChildrenNeedTravelingShoes,
  ASongFlungUpToHeaven,
  AStudyInScarlet,
  GatherTogetherInMyName,
  KnowWhyTheCagedBirdSings,
  MomAndMeAndMom,
  OnThePulseOfMorning,
  SinginAndSwinginAndGettingMerryLikeChristmas,
  TheHeartOfAWoman,
  TheMurdersInTheRueMorgue,
  TheWeekOfDiana,
]

const blockchainSettings = {
  MINIMUM_BLOCK_HEIGHT: 100,
  ENABLE_TIMESTAMPING: true,
  TIMESTAMP_INTERVAL_IN_SECONDS: 10,
  BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
  READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
  UPLOAD_CLAIM_INTERVAL_IN_SECONDS: 5,
}

const bitcoindClient = new Client({
  host: process.env.BITCOIN_URL || 'bitcoind-1',
  port: 18443,
  network: 'regtest',
  password: 'bitcoinrpcpassword',
  username: 'bitcoinrpcuser',
})

const setUpServerAndDb = async () => {
  const db = await createDatabase(PREFIX)
  const server = await app({
    BITCOIN_URL: process.env.BITCOIN_URL || 'bitcoind-1',
    API_PORT: NODE_PORT,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX,
    ...blockchainSettings,
  })

  return { db, server }
}

const getClaimWithoutTimestamp = (claim: any) => pickBy((v: any, k: string) => k !== 'timestamp', claim)
const getClaimsWithoutTimestamps = (claims: ReadonlyArray<any>) => claims.map(getClaimWithoutTimestamp)

const setUpExistingClaims = async (claims: ReadonlyArray<Claim>) =>
  await Promise.all(claims.map(async (claim: Claim) => postWorkToNode(claim)))

describe('GET /works/:id', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb()

  // Make sure node has regtest coins to pay for transactions.
  await ensureBitcoinBalance(bitcoindClient)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  // Submit a claim
  await setUpExistingClaims([TheRaven])

  // Wait for a claim batch to be submitted to the blockchain.
  await delay(parseInt(process.env.TIMESTAMP_INTERVAL_IN_SECONDS || '10', 10) * 1000 * 2)

  // mine N confirmation blocks on bitcoindA.
  await bitcoindClient.generate(parseInt(process.env.CONFIRMATION_BLOCKS || '1', 10))

  // Wait for claim batches to be read from the blockchain.
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 2)

  {
    let theRavenClaim
    let theRavenResponse
    try {
      theRavenResponse = await getWorkFromNode(TheRaven.id)
      theRavenClaim = await theRavenResponse.json()
    } catch (err) {
      theRavenClaim = {}
    }

    assert({
      given: 'an id of a submitted work',
      should: 'reuturn ok',
      actual: theRavenResponse.ok,
      expected: true,
    })

    assert({
      given: 'an id of a submitted work',
      should: 'return a claim with the matching id',
      actual: theRavenClaim.id,
      expected: TheRaven.id,
    })

    assert({
      given: 'given an id of a submitted work',
      should: 'return the entire claim',
      actual: theRavenClaim.attributes.name,
      expected: TheRaven.attributes.name,
    })

    const invalidResponse = await getWorkFromNode('1234')
    assert({
      given: 'an invalid id',
      should: 'return 404',
      actual: invalidResponse.status,
      expected: 404,
    })

    assert({
      given: 'an invalid id',
      should: 'should return an empty body',
      actual: await invalidResponse.text(),
      expected: '',
    })
  }

  await server.stop()
  await db.teardown()
})

describe('GET /works', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb()

  // Make sure node has regtest coins to pay for transactions.
  await ensureBitcoinBalance(bitcoindClient)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  // Submit claims
  await setUpExistingClaims(works)

  // Wait for a claim batch to be submitted to the blockchain.
  await delay(parseInt(process.env.TIMESTAMP_INTERVAL_IN_SECONDS || '10', 10) * 1000 * 2)

  // mine N confirmation blocks on bitcoindA.
  await bitcoindClient.generate(parseInt(process.env.CONFIRMATION_BLOCKS || '1', 10))

  // Wait for claim batches to be read from the blockchain.
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 2)

  {
    const response = await getWorkFromNode('')
    const claims = await response.json()

    assert({
      given: 'a call to GET /works',
      should: 'return ok',
      actual: response.ok,
      expected: true,
    })

    assert({
      given: 'a call to GET /works',
      should: 'return a status of 200',
      actual: response.status,
      expected: 200,
    })

    assert({
      given: 'a call to GET /works',
      should: 'return an Array',
      actual: Array.isArray(claims),
      expected: true,
    })

    assert({
      given: 'a call to GET /claims',
      should: 'return at least 3 claims',
      actual: claims.length >= 3,
      expected: true,
    })

    assert({
      given: 'a call to GET /works',
      should: 'return no more than 10 claims',
      actual: claims.length <= 10,
      expected: true,
    })

    assert({
      given: 'a call to GET /works',
      should: 'return count in the header X-Total-Count',
      actual: await response.headers.get('X-Total-Count'),
      expected: '13',
    })

    assert({
      given: 'a call to GET /works',
      should: 'return only signed claims',
      actual: all(isClaim)(getClaimsWithoutTimestamps(claims)),
      expected: true,
    })
  }

  {
    const limit = 4
    const limitedResponse = await getWorkFromNode(`?limit=${limit}`)
    const limitedClaims = await limitedResponse.json()

    assert({
      given: `a call to GET /works with a limit of ${limit}`,
      should: `return no more than ${limit} items`,
      actual: limitedClaims.length,
      expected: limit,
    })

    const offset = '3'
    const offsetResponse = await getWorkFromNode(`?offset=${offset}&limit=${limit}`)
    const offsetClaims = await offsetResponse.json()

    assert({
      given: `an offset of ${offset} and a limit of ${limit}`,
      should: `return items, offset by ${offset}`,
      actual: offsetClaims[0],
      expected: limitedClaims[3],
    })

    assert({
      given: `an offset of ${offset} and a limit of ${limit}`,
      should: `return ${limit} items`,
      actual: offsetClaims.length,
      expected: limit,
    })
  }

  {
    const response = await getWorkFromNode(`?test=test`)
    assert({
      given: 'a call to GET /works with an invalid query param',
      should: 'return a 422',
      actual: response.status,
      expected: 422,
    })
  }

  await server.stop()
  await db.teardown()
})

describe('GET /works?publicKey=:publicKey', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb()

  // Make sure node has regtest coins to pay for transactions.
  await ensureBitcoinBalance(bitcoindClient)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  // Submit claims
  await setUpExistingClaims(works)

  // Wait for a claim batch to be submitted to the blockchain.
  await delay(parseInt(process.env.TIMESTAMP_INTERVAL_IN_SECONDS || '10', 10) * 1000 * 2)

  // mine N confirmation blocks on bitcoindA.
  await bitcoindClient.generate(parseInt(process.env.CONFIRMATION_BLOCKS || '1', 10))

  // Wait for claim batches to be read from the blockchain.
  await delay(parseInt(process.env.READ_DIRECTORY_INTERVAL_IN_SECONDS || '5', 10) * 1000 * 2)

  const getPublicKeys = (claims: any) => pluck('publicKey')(claims)

  {
    const response = await getWorkFromNode(`?publicKey=${ABraveAndStartlingTruth.publicKey}`)
    const claims = await response.json()
    const publicKeys = uniq(getPublicKeys(claims))
    const claimsWithoutTimestamps = getClaimsWithoutTimestamps(claims)

    assert({
      given: 'a call to get works for a publicKey',
      should: 'succeed',
      actual: response.ok,
      expected: true,
    })

    assert({
      given: 'a call to GET /works for a publicKey',
      should: 'return 200',
      actual: response.status,
      expected: 200,
    })

    assert({
      given: `a call to GET /works for the MA publicKey`,
      should: `return claims for the publicKey`,
      actual: claims.length,
      expected: 10,
    })

    assert({
      given: 'a call to GET /works for a publicKey',
      should: 'return only claims created by that publicKey',
      actual: publicKeys,
      expected: [ABraveAndStartlingTruth.publicKey],
    })

    assert({
      given: 'a call to GET /works for a publicKey',
      should: 'return count in the header X-Total-Count',
      actual: await response.headers.get('X-Total-Count'),
      expected: '10',
    })

    assert({
      given: 'a call to GET /works for a publicKey',
      should: 'return only signedClaims',
      actual: all(isClaim)(claimsWithoutTimestamps),
      expected: true,
    })
  }

  {
    const response = await getWorkFromNode(`?publicKey=${TheRaven.publicKey}`)
    const claims = await response.json()
    const publicKeys = uniq(getPublicKeys(claims))

    assert({
      given: 'a call to GET /works for the EAP public',
      should: 'return a different list',
      actual: claims.length,
      expected: 2,
    })

    assert({
      given: 'a call to GET /works for a different publicKey',
      should: 'return only claims created by that publicKey',
      actual: publicKeys,
      expected: [TheRaven.publicKey],
    })
  }

  {
    const response = await getWorkFromNode('?publicKey=')

    assert({
      given: 'a call to GET /works for a missing publicKey value',
      should: 'return 422',
      actual: response.status,
      expected: 422,
    })
  }

  {
    const response = await getWorkFromNode('?publicKey=unknown')
    const claims = await response.json()

    assert({
      given: 'an publicKey with no claims',
      should: 'return ok',
      actual: response.ok,
      expected: true,
    })

    assert({
      given: 'an publicKey with no claims',
      should: 'return 200',
      actual: response.status,
      expected: 200,
    })

    assert({
      given: 'an publicKey with no claims',
      should: 'return an empty array',
      actual: claims,
      expected: [],
    })
  }

  await server.stop()
  await db.teardown()
})

describe('POST /works', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb()

  // Make sure node has regtest coins to pay for transactions.
  await ensureBitcoinBalance(bitcoindClient)

  // Allow everything to finish starting.
  await delay(5 * 1000)

  {
    const response = await postWorkToNode(ABraveAndStartlingTruth)
    const body = await response.text()

    assert({
      given: 'POST /works with a signed verifiable claim',
      should: 'return 202',
      actual: response.status,
      expected: 202,
    })

    assert({
      given: 'POST /works with a signed verifiable claim',
      should: 'return an empty body',
      actual: body,
      expected: '',
    })

    await delay(1500)
    const retrievedResponse = await getWorkFromNode(ABraveAndStartlingTruth.id)
    const retrievedClaim = getClaimWithoutTimestamp(await retrievedResponse.json())

    assert({
      given: 'POST /works with a signed verifiable claim',
      should: 'be able to retrieve the claim by id',
      actual: retrievedResponse.ok,
      expected: true,
    })

    assert({
      given: 'POST /works with a signed verifiable claim',
      should: 'retrieve the full claim',
      actual: retrievedClaim,
      expected: ABraveAndStartlingTruth,
    })
  }

  {
    const invalidSignedClaim = {
      ...ABraveAndStartlingTruth,
      signature: 'invalid sig',
    }
    const response = await postWorkToNode(invalidSignedClaim)

    assert({
      given: 'POST /works with an invalidly signed claim',
      should: 'return 422',
      actual: response.status,
      expected: 422,
    })

    const actual = await response.text()
    const expected = "Claim's signature is incorrect."

    assert({
      given: 'POST /works with an invalidly signed claim',
      should: `return ${expected}`,
      actual,
      expected,
    })
  }

  await server.stop()
  await db.teardown()
})

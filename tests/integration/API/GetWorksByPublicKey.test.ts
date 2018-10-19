/* tslint:disable:no-relative-imports */
import { Claim, isClaim } from '@po.et/poet-js'
import { all, pickBy, pluck, uniq } from 'ramda'
import { describe } from 'riteway'

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
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'
import { getWork, postWorkWithDelay } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWorkWithDelay(NODE_PORT)

const setUpExistingClaims = async (claims: ReadonlyArray<Claim>) =>
  await Promise.all(claims.map(async (claim: Claim) => postWorkToNode(claim)))

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
  TheRaven,
  TheWeekOfDiana,
]

const getClaimWithoutTimestamp = (claim: any) => pickBy((v: any, k: string) => k !== 'timestamp', claim)
const getClaimsWithoutTimestamps = (claims: ReadonlyArray<any>) => claims.map(getClaimWithoutTimestamp)

describe('GET /works?publicKey=:publicKey', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  // Submit claims
  await setUpExistingClaims(works)

  const getPublicKeys = (claims: any) => pluck('publicKey')(claims)

  {
    const given = 'a call to GET /works for the MA publicKey'
    const response = await getWorkFromNode(`?publicKey=${ABraveAndStartlingTruth.publicKey}`)
    const claims = await response.json()
    const publicKeys = uniq(getPublicKeys(claims))
    const claimsWithoutTimestamps = getClaimsWithoutTimestamps(claims)

    assert({
      given,
      should: 'succeed',
      actual: response.ok,
      expected: true,
    })

    assert({
      given,
      should: 'return 200',
      actual: response.status,
      expected: 200,
    })

    assert({
      given,
      should: `return claims for the publicKey`,
      actual: claims.length,
      expected: 10,
    })

    assert({
      given,
      should: 'return only claims created by that publicKey',
      actual: publicKeys,
      expected: [ABraveAndStartlingTruth.publicKey],
    })

    assert({
      given,
      should: 'return count in the header X-Total-Count',
      actual: await response.headers.get('X-Total-Count'),
      expected: '10',
    })

    assert({
      given,
      should: 'return only signedClaims',
      actual: all(isClaim)(claimsWithoutTimestamps),
      expected: true,
    })
  }

  {
    const given = 'a call to GET /works for the EAP publicKey'
    const response = await getWorkFromNode(`?publicKey=${TheRaven.publicKey}`)
    const claims = await response.json()
    const publicKeys = uniq(getPublicKeys(claims))

    assert({
      given,
      should: 'return a different list',
      actual: claims.length,
      expected: 2,
    })

    assert({
      given,
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
    const given = 'a publicKey with no associated claims'
    const response = await getWorkFromNode('?publicKey=unknown')
    const claims = await response.json()

    assert({
      given,
      should: 'return ok',
      actual: response.ok,
      expected: true,
    })

    assert({
      given,
      should: 'return 200',
      actual: response.status,
      expected: 200,
    })

    assert({
      given,
      should: 'return an empty array',
      actual: claims,
      expected: [],
    })
  }

  await server.stop()
  await db.teardown()
})

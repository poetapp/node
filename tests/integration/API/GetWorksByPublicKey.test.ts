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
import { getWork, postWork } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWork(NODE_PORT)

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

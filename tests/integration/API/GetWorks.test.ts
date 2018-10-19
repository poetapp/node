/* tslint:disable:no-relative-imports */
import { Claim, isClaim } from '@po.et/poet-js'
import { all, pickBy } from 'ramda'
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
import { delay, runtimeId, setUpServerAndDb } from '../../helpers/utils'
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

describe('GET /works', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  // Wait for everything to finish starting
  await delay(5 * 1000)

  // Setup Existing Claims
  await setUpExistingClaims(works)

  {
    const given = 'a call to GET /works'
    const response = await getWorkFromNode('')
    const claims = await response.json()

    assert({
      given,
      should: 'return ok',
      actual: response.ok,
      expected: true,
    })

    assert({
      given,
      should: 'return a status of 200',
      actual: response.status,
      expected: 200,
    })

    assert({
      given,
      should: 'return an Array',
      actual: Array.isArray(claims),
      expected: true,
    })

    assert({
      given,
      should: 'return at least 3 claims',
      actual: claims.length >= 3,
      expected: true,
    })

    assert({
      given,
      should: 'return no more than 10 claims',
      actual: claims.length <= 10,
      expected: true,
    })

    assert({
      given,
      should: 'return count in the header X-Total-Count',
      actual: await response.headers.get('X-Total-Count'),
      expected: '13',
    })

    assert({
      given,
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

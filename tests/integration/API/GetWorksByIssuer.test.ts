/* tslint:disable:no-relative-imports */
import { SignedVerifiableClaim, isSignedVerifiableClaim } from '@po.et/poet-js'
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

const setUpExistingClaims = async (claims: ReadonlyArray<SignedVerifiableClaim>) =>
  await Promise.all(claims.map(async (claim: SignedVerifiableClaim) => postWorkToNode(claim)))

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

const getClaimWithoutAnchor = (claim: any) => pickBy((v: any, k: string) => k !== 'anchor', claim)
const getClaimsWithoutAnchors = (claims: ReadonlyArray<any>) => claims.map(getClaimWithoutAnchor)

describe('GET /works?issuer=:issuer', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  // Submit claims
  await setUpExistingClaims(works)

  const getissuers = (claims: any) => pluck('issuer')(claims)

  {
    const given = 'a call to GET /works for the MA issuer'
    const response = await getWorkFromNode(`?issuer=${encodeURIComponent(ABraveAndStartlingTruth.issuer)}`)
    const claims = await response.json()
    const issuers = uniq(getissuers(claims))
    const claimsWithoutAnchors = getClaimsWithoutAnchors(claims)

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
      should: `return claims for the issuer`,
      actual: claims.length,
      expected: 10,
    })

    assert({
      given,
      should: 'return only claims created by that issuer',
      actual: issuers,
      expected: [ABraveAndStartlingTruth.issuer],
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
      actual: all(isSignedVerifiableClaim)(claimsWithoutAnchors),
      expected: true,
    })
  }

  {
    const given = 'a call to GET /works for the EAP issuer'
    const response = await getWorkFromNode(`?issuer=${TheRaven.issuer}`)
    const claims = await response.json()
    const issuers = uniq(getissuers(claims))

    assert({
      given,
      should: 'return a different list',
      actual: claims.length,
      expected: 2,
    })

    assert({
      given,
      should: 'return only claims created by that issuer',
      actual: issuers,
      expected: [TheRaven.issuer],
    })
  }

  {
    const response = await getWorkFromNode('?issuer=')

    assert({
      given: 'a call to GET /works for a missing issuer value',
      should: 'return 422',
      actual: response.status,
      expected: 422,
    })
  }

  {
    const given = 'a issuer with no associated claims'
    const response = await getWorkFromNode('?issuer=unknown')
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

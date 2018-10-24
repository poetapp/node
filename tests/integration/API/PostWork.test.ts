/* tslint:disable:no-relative-imports */
import { pickBy } from 'ramda'
import { describe } from 'riteway'

import { ABraveAndStartlingTruth, TheRaven } from '../../helpers/Claims'
import { delay, runtimeId, setUpServerAndDb } from '../../helpers/utils'
import { getWork, postWork } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWork(NODE_PORT)

const getClaimWithoutTimestamp = (claim: any) => pickBy((v: any, k: string) => k !== 'timestamp', claim)

describe('POST /works', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

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

    await delay(5000)

    const retrievedResponse = await getWorkFromNode(ABraveAndStartlingTruth.id)
    const retrievedClaim = getClaimWithoutTimestamp(await retrievedResponse.json())

    assert({
      given: 'a work posted to node',
      should: 'retrieve the work by id',
      actual: retrievedResponse.ok,
      expected: true,
    })

    assert({
      given: 'a work posted to node',
      should: 'retrieve the full claim',
      actual: retrievedClaim,
      expected: ABraveAndStartlingTruth,
    })
  }

  {
    const invalidSignedClaim = {
      ...ABraveAndStartlingTruth,
      'sec:proof': TheRaven['sec:proof'],
    }

    const response = await postWorkToNode(invalidSignedClaim)

    assert({
      given: 'POST /works with an invalidly signed claim',
      should: 'return 422',
      actual: response.status,
      expected: 422,
    })

    const actual = await response.text()
    const expected = "Signed Verifiable Claim's signature is incorrect."

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

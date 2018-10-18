import {Claim} from "@po.et/poet-js";

/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { TheRaven } from '../../helpers/Claims'
import { delay, runtimeId, setUpServerAndDb} from '../../helpers/utils'
import { getWork, postWork } from '../../helpers/works'

describe('GET /works/:id', async assert => {
  // Setup Mongodb and the app server
  const PREFIX = `test-functional-node-poet-${runtimeId()}`
  const NODE_PORT = '28081'

  const getWorkFromNode = getWork(NODE_PORT)
  const postWorkToNode = postWork(NODE_PORT)

  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  // Wait for everything to finish starting
  await delay(5 * 1000)

  // Submit a claim
  await postWorkToNode(TheRaven)

  // Wait for a claim batch to be submitted to the store.
  await delay(parseInt(process.env.TIMESTAMP_INTERVAL_IN_SECONDS || '10', 10) * 1000 * 2)

  {
    const theRavenResponse = await getWorkFromNode(TheRaven.id)
    const theRavenClaim = await theRavenResponse.json()

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

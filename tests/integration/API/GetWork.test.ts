/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { TheRaven } from '../../helpers/Claims'
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'
import { getWork, postWorkWithDelay } from '../../helpers/works'

describe('GET /works/:id', async assert => {
  // Setup Mongodb and the app server
  const PREFIX = `test-functional-node-poet-${runtimeId()}`
  const NODE_PORT = '28081'

  const getWorkFromNode = getWork(NODE_PORT)
  const postWorkToNode = postWorkWithDelay(NODE_PORT)

  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  // Submit a claim
  await postWorkToNode(TheRaven)

  {
    const theRavenResponse = await getWorkFromNode(TheRaven.id)
    const theRavenClaim = await theRavenResponse.json()

    assert({
      given: 'an id of a submitted work',
      should: 'return ok',
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

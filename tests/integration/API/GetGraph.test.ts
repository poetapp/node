/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { ABraveAndStartlingTruth, TheRaven } from '../../helpers/Claims'
import { delay, runtimeId, setUpServerAndDb } from '../../helpers/utils'
import { getWork, postWork } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWork(NODE_PORT)

describe('GET /graph', async assert => {
  const { db, server, rabbitMQ } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  {
    await postWorkToNode(ABraveAndStartlingTruth)

    await delay(5000)

  }

  await server.stop()
  await db.teardown()
  await rabbitMQ.stop()
})

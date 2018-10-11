/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { app } from '../../src/app'
import { getHealth } from '../helpers/health'
import { delay, runtimeId, createDatabase } from '../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'

describe('Health Endpoint Returns the Correct Fields', async (assert: any) => {
  const db = await createDatabase(PREFIX)
  const server = await app({
    BITCOIN_URL: process.env.BITCOIN_URL || 'bitcoind-1',
    API_PORT: NODE_PORT,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX,
  })

  // Allow everything to finish starting.
  await delay(5 * 1000)

  {
    // Check health.

    const response = await getHealth(NODE_PORT)
    const healthData = await response.json()

    const { mongoIsConnected, ipfsIsConnected } = healthData

    assert({
      given: 'a request to the health endpoing',
      should: 'return object with property mongoIsConnected',
      actual: typeof mongoIsConnected,
      expected: 'boolean',
    })

    assert({
      given: 'a request to the health endpoing',
      should: 'return object with property ipfsIsConnected',
      actual: typeof ipfsIsConnected,
      expected: 'boolean',
    })
  }
  await server.stop()
  await db.teardown()
})

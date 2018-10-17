/* tslint:disable:no-relative-imports */
import { isNil } from 'ramda'
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

    const { mongoIsConnected, ipfsInfo, blockchainInfo, networkInfo, walletInfo } = healthData

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property mongoIsConnected',
      actual: typeof mongoIsConnected,
      expected: 'boolean',
    })

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property ipfsInfo',
      actual: isNil(ipfsInfo),
      expected: false,
    })

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property blockchainInfo',
      actual: isNil(blockchainInfo),
      expected: false,
    })

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property walletInfo',
      actual: isNil(walletInfo),
      expected: false,
    })

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property networkInfo',
      actual: isNil(networkInfo),
      expected: false,
    })
  }
  await server.stop()
  await db.teardown()
})

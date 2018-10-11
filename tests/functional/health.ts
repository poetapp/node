/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { app } from '../../src/app'
import { dbHelper } from '../helpers/database'
import { getHealth } from '../helpers/health'
import { delay, runtimeId } from '../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'

const blockchainSettings = {
  MINIMUM_BLOCK_HEIGHT: 100,
  ENABLE_TIMESTAMPING: true,
  TIMESTAMP_INTERVAL_IN_SECONDS: 10,
  BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
  READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
}


const createDatabase = async (prefix: string) => {
  const db = dbHelper()

  return {
    teardown: db.teardown,
    settings: await db.setup(prefix),
  }
}

describe('Health Endpoint Returns the Correct Fields', async (assert: any) => {

  const dbA = await createDatabase(PREFIX)
  const serverA = await app({
    BITCOIN_URL: process.env.BITCOIN_URL || "bitcoind-1",
    API_PORT: NODE_PORT,
    MONGODB_DATABASE: dbA.settings.tempDbName,
    MONGODB_USER: dbA.settings.tempDbUser,
    MONGODB_PASSWORD: dbA.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX,
    ...blockchainSettings
  });


  // Allow everything to finish starting.
  await delay(5 * 1000)

  
  {
    // Check health.

    const response = await getHealth(NODE_PORT)
    const healthData = await response.json()

    const { mongoIsConnected, ipfsIsConnected } = healthData

    assert({
      given: 'a request to the health endpoing',
      should: 'return mongoIsConnected and ipfsIsConnected',
      actual: typeof mongoIsConnected,
      expected: 'boolean',
    })

    assert({
      given: 'a request to the health endpoing',
      should: 'return mongoIsConnected and ipfsIsConnected',
      actual: typeof ipfsIsConnected,
      expected: 'boolean',
    })
  }
  await serverA.stop()
  await dbA.teardown()
})

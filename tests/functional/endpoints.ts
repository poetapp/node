/* tslint:disable:no-relative-imports */
import { isNil } from 'ramda'
import { describe } from 'riteway'

import { app } from '../../src/app'
import { ensureBitcoinBalance, resetBitcoinServers } from '../helpers/bitcoin'
import { getHealth, getMetrics } from '../helpers/endpoints'
import { delay, runtimeId, createDatabase } from '../helpers/utils'
const Client = require('bitcoin-core')

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const LOW_WALLET_BALANCE_IN_BITCOIN = 1
const bitcoindClient = new Client({
  host: process.env.BITCOIN_URL || 'bitcoind-1',
  port: 18443,
  network: 'regtest',
  password: 'bitcoinrpcpassword',
  username: 'bitcoinrpcuser',
})

describe('Health Endpoint Returns the Correct Fields', async (assert: any) => {
  const db = await createDatabase(PREFIX)

  await resetBitcoinServers()
  await delay(5 * 1000)

  const server = await app({
    BITCOIN_URL: process.env.BITCOIN_URL || 'bitcoind-1',
    API_PORT: NODE_PORT,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX,
    LOW_WALLET_BALANCE_IN_BITCOIN,
    HEALTH_INTERVAL_IN_SECONDS: 1,
  })

  // Allow everything to finish starting.

  await delay(5 * 1000)

  {
    // Check health.

    const response = await getHealth(NODE_PORT)
    const healthData = await response.json()

    const { mongoIsConnected, ipfsInfo, blockchainInfo, networkInfo, walletInfo, estimatedSmartFeeInfo } = healthData

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

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property estimatedSmartFeeInfo',
      actual: isNil(estimatedSmartFeeInfo),
      expected: false,
    })

    assert({
      given: `a request to the health endpoint while the bitcoin balance is below LOW_WALLET_BALANCE_BTC`,
      should: 'return walletInfo property isBalanceLow as true',
      actual: walletInfo.isBalanceLow,
      expected: true,
    })
  }

  // Make sure node has regtest coins: Genrate 101 blocks at 25BTC/block if none.
  await ensureBitcoinBalance(bitcoindClient)

  // Make sure health service runs again.
  await delay(10 * 1000)

  {
    // Check isBalanceLow is false.

    const response = await getHealth(NODE_PORT)
    const healthData = await response.json()

    const {
      walletInfo: { isBalanceLow },
    } = healthData

    assert({
      given: `a request to the health endpoint while the bitcoin balance is above LOW_WALLET_BALANCE_BTC`,
      should: 'return walletInfo property isBalanceLow as false',
      actual: isBalanceLow,
      expected: false,
    })
  }

  {

    const response = await getMetrics(NODE_PORT)
    const metricsData = await response.json()
    const { TotalWorkClaims } = metricsData

    assert({
      given: 'a request to the health endpoint',
      should: 'return object with property networkInfo of type number',
      actual: typeof TotalWorkClaims,
      expected: 'number',
    })
  }

  await server.stop()
  await db.teardown()
})

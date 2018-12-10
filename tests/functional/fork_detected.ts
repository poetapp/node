/* tslint:disable:no-relative-imports */
import { Message } from 'amqplib'
import { describe } from 'riteway'

import { ForkDetected } from '../../src/Messaging/Messages'
import { bitcoindClients, resetBitcoinServers, generateReorgs } from '../helpers/bitcoin'
import { delay, runtimeId, setUpServerAndDb, timeoutPromise } from '../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'

const blockchainSettings = {
  MINIMUM_BLOCK_HEIGHT: 0,
  ENABLE_ANCHORING: true,
  ANCHOR_INTERVAL_IN_SECONDS: 10,
  BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
  READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
  UPLOAD_CLAIM_INTERVAL_IN_SECONDS: 5,
}

const { bitcoinCoreClientA, bitcoinCoreClientB }: any = bitcoindClients()

describe('Fork detected', async (assert) => {
  await resetBitcoinServers()
  await bitcoinCoreClientB.addNode(bitcoinCoreClientA.host, 'add')
  await delay(5 * 1000)

  const { db, server, rabbitMQ } = await setUpServerAndDb({ PREFIX, NODE_PORT, blockchainSettings })

  await delay(5 * 1000)

  const FORK_DETECTED = `${PREFIX}.FORK_DETECTED`
  await generateReorgs(bitcoinCoreClientA, bitcoinCoreClientB)

  const consumeForkDetected = (): Promise<ForkDetected> => new Promise(async resolve => {
    await rabbitMQ.consume(FORK_DETECTED, async (message: Message) => {
      const fork = JSON.parse(message.content.toString())
      resolve(fork)
    })
  })

  const fork = await Promise.race([timeoutPromise(60), consumeForkDetected()]).catch(() => ({}))

  assert({
    given: 'a FORK_DETECTED from RabbitMQ',
    should: 'have a blockHash property of type string',
    actual: typeof fork.blockHash,
    expected: 'string',
  })

  assert({
    given: 'a FORK_DETECTED from RabbitMQ',
    should: 'have a blockHeight property of type number',
    actual: typeof fork.blockHeight,
    expected: 'number',
  })

  await server.stop()
  await db.teardown()
  await rabbitMQ.stop()
})

/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { bitcoindClients, resetBitcoinServers, generateReorgs } from '../helpers/bitcoin'
import { RabbitMQ } from '../helpers/rabbitMQ'
import { delay, runtimeId } from '../helpers/utils'
import { setUpServerAndDb } from '../helpers/utils'

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

const { btcdClientA, btcdClientB }: any = bitcoindClients()

describe('Fork detected', async (assert: any) => {
  await resetBitcoinServers()

  await delay(5 * 1000)

  await btcdClientB.addNode(btcdClientA.host, 'add')
  const rabbitMQ = await RabbitMQ()
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT, blockchainSettings })

  await delay(5 * 1000)

  const FORK_DETECTED = `${PREFIX}.BLOCKCHAIN_READER::FORK_DETECTED`
  await generateReorgs(btcdClientA, btcdClientB)

  const getFork = (): Promise<{ blockHash: string, blockHeight: number }> => new Promise(async (resolve) => {
    await rabbitMQ.consume(FORK_DETECTED, async (message: any) => {
      const fork = JSON.parse(message.content.toString())
      resolve(fork)
    })
  })

  const fork = await getFork()

  assert({
    given: 'a BLOCKCHAIN_READER::FORK_DETECTED from RabbitMQ',
    should: 'have a blockHash property of type string',
    actual: typeof fork.blockHash,
    expected: 'string',
  })

  assert({
    given: 'a BLOCKCHAIN_READER::FORK_DETECTED from RabbitMQ',
    should: 'have a blockHeight property of type number',
    actual: typeof fork.blockHeight,
    expected: 'number',
  })

  await server.stop()
  await db.teardown()
  await rabbitMQ.stop()
})

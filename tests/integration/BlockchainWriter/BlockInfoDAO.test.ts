/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { BlockInfoDAO } from '../../../src/BlockchainWriter/BlockInfoDAO'
import { runtimeId, setUpDb } from '../../helpers/utils'

const prefix = runtimeId()

describe('BlockInfoDAO.insertBlockInfo', async assert => {
  const db = await setUpDb(prefix)
  const { result, mongoClient } = await db.collection('blockchainInfo')
  const blockchainInfoCollection = result
  const blockInfoDAO = new BlockInfoDAO(blockchainInfoCollection)
  await blockInfoDAO.start()
  const expected = { height: 12345, hash: 'this-is-a-hash', previousHash: 'this-is-a-parent-hash' }
  await blockInfoDAO.insertBlockInfo(expected)
  const actual = await blockchainInfoCollection.find().limit(1).next()

  assert({
    given: 'a lightBlock',
    should: 'store the block in mongodb',
    actual,
    expected,
  })

  await mongoClient.close()
  await db.teardown()
})

describe('BlockInfoDAO.getHighestBlock', async assert => {
  const db = await setUpDb(prefix)
  const { result, mongoClient } = await db.collection('blockchainInfo')
  const blockchainInfoCollection = result
  const blockInfoDAO = new BlockInfoDAO(blockchainInfoCollection)
  await blockInfoDAO.start()
  await blockInfoDAO.insertBlockInfo({ height: 1234, hash: 'wrong-hash', previousHash: 'wrong-hash-parent' })
  const expected = { height: 54321, hash: 'good-hash', previousHash: 'parentHash '}
  await blockInfoDAO.insertBlockInfo(expected)
  const actual = await blockInfoDAO.getHighestBlock()

  assert({
    given: 'multiple blocks in mongo',
    should: 'retrieve the block with the greatest height',
    actual,
    expected,
  })

  await mongoClient.close()
  await db.teardown()
})

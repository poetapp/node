/* tslint:disable:no-relative-imports */
import { omit } from 'ramda'
import { describe } from 'riteway'
import { BlockInfoDAO } from './BlockInfoDAO'

import { runtimeId, setUpDb } from '../../tests/helpers/utils'

const prefix = `test-unit-node-poet-${runtimeId()}`

describe('BlockInfoDAO.insertBlockInfo', async assert => {
  const db = await setUpDb(prefix)
  const { result, mongoClient } = await db.collection('blockchainInfo')
  const blockchainInfoCollection = result

  const blockInfoDAO = new BlockInfoDAO(blockchainInfoCollection)
  const expected = { height: 1234, hash: 'this-is-a-hash', previousHash: '' }
  await blockInfoDAO.insertBlockInfo(expected)
  const findResult = await blockchainInfoCollection.find().limit(1)
  const actual = await findResult.next()

  assert({
    given: 'a block heigt and a hash',
    should: 'store the object in mongodb',
    actual,
    expected,
  })
  await mongoClient.close()
  await db.teardown()
})

describe('BlockInfoDAO.getMaxHeight', async assert => {
  const db = await setUpDb(prefix)
  const { result, mongoClient } = await db.collection('blockchainInfo')
  const blockchainInfoCollection = result

  const blockInfoDAO = new BlockInfoDAO(blockchainInfoCollection)
  await blockInfoDAO.insertBlockInfo({ height: 12345, hash: 'this-is-the-wrong-hash', previousHash: ''})
  const expected = { height: 23456, hash: 'this-is-the-correct-hash', previousHash: '' }
  await blockInfoDAO.insertBlockInfo(expected)
  const actual = await blockInfoDAO.getMaxHeightBlock()
  assert({
    given: 'multiple blocks in mongodb',
    should: 'return the block with the greatest height',
    actual,
    expected,
  })

  await mongoClient.close()
  await db.teardown()
})

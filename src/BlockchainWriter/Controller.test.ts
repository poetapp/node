/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { LightBlock } from '../Messaging/Messages'
import { convertLightBlockToEntry } from './Controller'
import { Entry } from './DAO'

describe('convertLightBlockToEntry', async assert => {
  {
    const expected: Entry = {blockHash: 'this-is-a-hash', blockHeight: 123}

    assert({
      given: 'a valid LightBlock',
      should: 'return a valid Entry',
      actual: convertLightBlockToEntry({hash: 'this-is-a-hash', height: 123, previousHash: 'parent-hash'}),
      expected,
    })
  }

  {
    const invalidLightBlock = {} as LightBlock
    const expected: Entry = { blockHash: undefined, blockHeight: undefined }

    assert({
      given: 'an empty LightBlock',
      should: 'return an Entry with undefined blockHash and blockHeight',
      actual: convertLightBlockToEntry(invalidLightBlock),
      expected,
    })
  }
})

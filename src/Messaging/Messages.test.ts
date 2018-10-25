import { describe } from 'riteway'

import { isBlockDownloaded } from './Messages'

describe('Messages.isBlockDownloaded', async assert => {
  const validBlockAnchor = {
    prefix: 'BARD',
    version: [1, 2],
    storageProtocol: 0,
    ipfsDirectoryHash: 'asd',
    transactionId: 'asd',
    blockHeight: 2,
    blockHash: 'asd',
  }

  const validBlockDownloaded = {
    block: {
      hash: 'asd',
      previousHash: 'asd',
      height: 2,
    },
    poetBlockAnchors: [validBlockAnchor],
  }

  const should = 'return the correct boolean'

  {
    assert({
      given: 'a valid BlockDownloaded object',
      should,
      actual: isBlockDownloaded(validBlockDownloaded),
      expected: true,
    })
  }

  {
    const blockDownloaded: any = {
      ...validBlockDownloaded,
      poetBlockAnchors: [],
    }

    assert({
      given: 'a BlockDownloaded with an empty array of poetBlockAnchors',
      should,
      actual: isBlockDownloaded(blockDownloaded),
      expected: true,
    })
  }

  {
    const blockDownloaded: any = {
      ...validBlockDownloaded,
      poetBlockAnchors: undefined,
    }

    assert({
      given: 'a BlockDownloaded with an undefined poetBlockAnchors',
      should,
      actual: isBlockDownloaded(blockDownloaded),
      expected: true,
    })
  }

  {
    const { poetBlockAnchors, ...blockDownloaded } = validBlockDownloaded

    assert({
      given: 'a BlockDownloaded without poetBlockAnchors',
      should,
      actual: isBlockDownloaded(blockDownloaded),
      expected: true,
    })
  }

  {
    const blockDownloaded: any = {
      ...validBlockDownloaded,
      poetBlockAnchors: null,
    }

    assert({
      given: 'a invalid BlockDownloaded with a null poetBlockAnchors',
      should,
      actual: isBlockDownloaded(blockDownloaded),
      expected: false,
    })
  }

  {
    const { block, ...blockDownloaded } = validBlockDownloaded

    assert({
      given: 'a BlockDownloaded without a LightBlock',
      should,
      actual: isBlockDownloaded(blockDownloaded),
      expected: false,
    })
  }
})

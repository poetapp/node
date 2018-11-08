import { PoetAnchor, PoetBlockAnchor, StorageProtocol } from '@po.et/poet-js'
import { allPass, equals } from 'ramda'
import { describe } from 'riteway'

import { poetAnchorToData } from 'BlockchainWriter/Bitcoin'

import { anchorPrefixAndVersionMatch, blockToPoetAnchors, bufferToPoetAnchor, isCorrectBufferLength } from './Bitcoin'

import * as TestBlock from './TestData/block-000000000000f29b1e2d33590208811f3cd2b2c190596424617a18460d878288.json'
import * as TestBlock1 from './TestData/block-00000000f8b690cb98c5bf9e221b47b493a27523e8e8b94a18022abd3e51fb42.json'

const PREFIX_POET = 'POET'
const PREFIX_BARD = 'BARD'

describe('Bitcoin.blockToPoetAnchors', async assert => {
  assert({
    given: 'testnet block 1440123',
    should: 'satisfy basic integrity checks',
    actual: validateTestBlockIntegrity(TestBlock),
    expected: true,
  })

  assert({
    given: 'testnet block 1288513',
    should: 'satisfy basic integrity checks',
    actual: validateTestBlock1Integrity(TestBlock1),
    expected: true,
  })

  const ipfsDirectoryHashes = ['QmVW4EyxJk77qU2VwpKnvFL8YAXQhj4HBKmq5SfMWy35JW']

  {
    const anchors = blockToPoetAnchors(TestBlock as any) // as any: see footer note

    const isBardAnchor = (poetAnchor: PoetBlockAnchor) => poetAnchor.prefix === PREFIX_BARD
    const anchorIsVersion03 = (poetAnchor: PoetBlockAnchor) => equals(poetAnchor.version, 3)
    const anchorIsBlockHash = (poetAnchor: PoetBlockAnchor) => poetAnchor.blockHash === TestBlock.hash
    const anchorIsBlockHeight = (poetAnchor: PoetBlockAnchor) => poetAnchor.blockHeight === TestBlock.height
    const anchorHasExpectedIpfsHash = (poetAnchor: PoetBlockAnchor) =>
      ipfsDirectoryHashes.includes(poetAnchor.ipfsDirectoryHash)

    const given = 'a test block with Po.et anchors'

    assert({
      given,
      should: 'return 4 Po.et-like anchors',
      actual: anchors.length,
      expected: 4,
    })

    assert({
      given,
      should: 'return have a prefix BARD anchor',
      actual: anchors.some(isBardAnchor),
      expected: true,
    })

    assert({
      given,
      should: 'return a version 0.3 anchor',
      actual: anchors.some(anchorIsVersion03),
      expected: true,
    })

    assert({
      given,
      should: 'return an anchor with an expected IPFS Directory Hash',
      actual: anchors.some(anchorHasExpectedIpfsHash),
      expected: true,
    })

    assert({
      given,
      should: 'all returned elements should have the blockHash set correctly',
      actual: anchors.filter(anchorIsBlockHash).length,
      expected: anchors.length,
    })

    assert({
      given,
      should: 'all returned elements should have the blockHeight set correctly',
      actual: anchors.filter(anchorIsBlockHeight).length,
      expected: anchors.length,
    })
  }

  {
    const poetAnchors = blockToPoetAnchors(TestBlock1)

    assert({
      given: 'a block that contains a transaction with scriptPubKey.type === "nullData" and no OP_RETURN',
      should: 'filter out the transaction',
      actual: poetAnchors.length,
      expected: 0,
    })
  }
})

describe('Bitcoin.getMatchingAnchors', async assert => {
  const anchorPoet0001: PoetBlockAnchor = {
    transactionId: '0b801f8cc7bec11048b18d9591d35eb747cfcbd1945ad4a72d6baf8f74c7da2e',
    storageProtocol: StorageProtocol.IPFS,
    prefix: PREFIX_POET,
    version: 1,
    ipfsDirectoryHash: 'QmWC8kTX1G75txRTFNaPhFukk222rxGgEjh2wKCKesj7Gw',
    blockHeight: 1411304,
    blockHash: '0000000000000011c35856348a9deb2a066facd71efb594a8429284022a99bdc',
  }

  const anchorPoet0002: PoetBlockAnchor = {
    ...anchorPoet0001,
    version: 2,
  }

  const anchorBard0001: PoetBlockAnchor = {
    ...anchorPoet0001,
    prefix: PREFIX_BARD,
  }

  const anchorBard0002: PoetBlockAnchor = {
    ...anchorBard0001,
    version: 2,
  }

  const anchorPoet0001b: PoetBlockAnchor = {
    ...anchorPoet0001,
    ipfsDirectoryHash: 'asdxx',
  }

  const anchors: ReadonlyArray<PoetBlockAnchor> = [
    anchorPoet0001,
    anchorPoet0002,
    anchorBard0001,
    anchorBard0002,
    anchorPoet0001b,
  ]

  const given = 'an array of anchors'

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_POET, 1)),
    expected: [anchorPoet0001, anchorPoet0001b],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, 1)),
    expected: [anchorBard0001],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_POET, 2)),
    expected: [anchorPoet0002],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, 2)),
    expected: [anchorBard0002],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, 3)),
    expected: [],
  })
})

describe('Bitcoin.bufferToPoetAnchor', async assert => {
  function assertSample(prefix: string, version: number, storageProtocol: StorageProtocol, ipfsDirectoryHash: string) {
    const expected: PoetAnchor = {
      prefix,
      version,
      storageProtocol,
      ipfsDirectoryHash,
    }
    const data = poetAnchorToData(expected)

    assert({
      given: 'a hex string of a Po.et anchor',
      should: 'return the anchor correctly parsed',
      actual: bufferToPoetAnchor(Buffer.from(data, 'hex')),
      expected,
    })
  }

  assertSample('POET', 23, StorageProtocol.IPFS, 'Jim')
  assertSample('BARD', 23, StorageProtocol.IPFS, 'Robert')
  assertSample('POET', 10, StorageProtocol.IPFS, 'Roger')
  assertSample('BARD', 10, StorageProtocol.IPFS, 'Syd')
})

describe('Bitcoin.bufferToPoetAnchor', async assert => {
  const bufferFromAnchor = (
    prefix: string,
    version: number,
    storageProtocol: StorageProtocol,
    ipfsDirectoryHash: string,
  ): Buffer =>
    Buffer.from(
      poetAnchorToData({
        prefix,
        version,
        storageProtocol,
        ipfsDirectoryHash,
      }),
      'hex',
    )

  assert({
    given: 'Buffer from correct poet anchor with IPFS file hash',
    should: 'return true',
    actual: isCorrectBufferLength(
      bufferFromAnchor('POET', 23, StorageProtocol.IPFS, 'QmPth96BuMUhHJDDiTNL6wphBMCXQWTDmm1uQe63VeGmPT'),
    ),
    expected: true,
  })

  assert({
    given: 'Buffer from correct poet anchor with IPFS directory hash',
    should: 'return true',
    actual: isCorrectBufferLength(
      bufferFromAnchor('POET', 23, StorageProtocol.IPFS, 'Qmdrv2VoXKpzpSzS1iKpWMxfM9THEhGgBriKqbMyAiTF1U'),
    ),
    expected: true,
  })

  assert({
    given: 'Buffer from incorrect OP_RETURN data',
    should: 'return false',
    actual: isCorrectBufferLength(Buffer.from('OP_HS1')),
    expected: false,
  })
})

// Would be way better to validate the block's hash
const validateTestBlockIntegrity = allPass([
  (block: any) => block.tx,
  (block: any) => Array.isArray(block.tx),
  (block: any) => block.tx.length === 81,
])

const validateTestBlock1Integrity = allPass([
  (block: any) => block.tx,
  (block: any) => Array.isArray(block.tx),
  (block: any) => block.tx.length === 123,
])

const localeCompare = (a: string, b: string) => a.localeCompare(b)

/*
 TestBlock as any:
   TS actually parses the JSON and knows it has more properties than the ones defined in the Block interface,
   so the build fails.

   Rather than defining the complete interface for Block (which we don't need and is pretty complex),
   we can cast to any here and let it fail at run time if TestBlock isn't valid.

   This would only happen if we accidentally modified the block's json, which validateTestBlockIntegrity should prevent.
 */

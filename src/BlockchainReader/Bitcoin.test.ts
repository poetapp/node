import { PoetAnchor, PoetBlockAnchor, StorageProtocol } from '@po.et/poet-js'
import { allPass, equals } from 'ramda'
import { describe } from 'riteway'

import { poetAnchorToData } from 'BlockchainWriter/Bitcoin'
import { PREFIX_BARD, PREFIX_POET } from 'Helpers/Bitcoin'

import { anchorPrefixAndVersionMatch, blockToPoetAnchors, bufferToPoetAnchor, isCorrectBufferLength } from './Bitcoin'

import * as TestBlock from './TestData/block-0000000070746b06bbec07a7cd35e0c6d47bfa4e2544a6a1d2aa6efc49d47679.json'
import * as TestBlock1 from './TestData/block-00000000f8b690cb98c5bf9e221b47b493a27523e8e8b94a18022abd3e51fb42.json'

describe('Bitcoin.blockToPoetAnchors', async assert => {
  assert({
    given: 'testnet block 1356137',
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

  const ipfsDirectoryHashes = ['QmaKtaPqfWvss2ndhGdcLRc9uGcLvUUyuZeGcrDZWN58Zi']

  {
    const poetAnchors = blockToPoetAnchors(TestBlock as any) // as any: see footer note

    const isBardAnchor = (poetAnchor: PoetBlockAnchor) => poetAnchor.prefix === PREFIX_BARD
    const anchorIsVersion03 = (poetAnchor: PoetBlockAnchor) => equals(poetAnchor.version, [0, 3])
    const anchorIsBlockHash = (poetAnchor: PoetBlockAnchor) => poetAnchor.blockHash === TestBlock.hash
    const anchorIsBlockHeight = (poetAnchor: PoetBlockAnchor) => poetAnchor.blockHeight === TestBlock.height
    const anchorHasUnexpectedIpfsHash = (poetAnchor: PoetBlockAnchor) =>
      !ipfsDirectoryHashes.includes(poetAnchor.ipfsDirectoryHash)

    const anchorsIpfsHashes = poetAnchors.map(poetAnchor => poetAnchor.ipfsDirectoryHash)

    const given = 'a test block with Po.et anchors'

    assert({
      given,
      should: 'return 1 Po.et Anchor',
      actual: poetAnchors.length,
      expected: 1,
    })

    assert({
      given,
      should: 'return prefix BARD anchors only',
      actual: poetAnchors.filter(isBardAnchor).length,
      expected: poetAnchors.length,
    })

    assert({
      given,
      should: 'return version 0.3 anchors only',
      actual: poetAnchors.filter(anchorIsVersion03).length,
      expected: poetAnchors.length,
    })

    assert({
      given,
      should: 'all returned elements should have the blockHash set correctly',
      actual: poetAnchors.filter(anchorIsBlockHash).length,
      expected: poetAnchors.length,
    })

    assert({
      given,
      should: 'all returned elements should have the blockHeight set correctly',
      actual: poetAnchors.filter(anchorIsBlockHeight).length,
      expected: poetAnchors.length,
    })

    assert({
      given,
      should: 'all returned elements should have an expected IPFS Directory Hash',
      actual: poetAnchors.find(anchorHasUnexpectedIpfsHash),
      expected: undefined,
    })

    assert({
      given,
      should: 'all expected IPFS Directory hashes should be in the returned anchors',
      actual: equals(anchorsIpfsHashes.sort(localeCompare), ipfsDirectoryHashes.sort(localeCompare)),
      expected: true,
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
    version: [0, 0, 0, 1],
    ipfsDirectoryHash: 'QmWC8kTX1G75txRTFNaPhFukk222rxGgEjh2wKCKesj7Gw',
    blockHeight: 1411304,
    blockHash: '0000000000000011c35856348a9deb2a066facd71efb594a8429284022a99bdc',
  }

  const anchorPoet0002: PoetBlockAnchor = {
    ...anchorPoet0001,
    version: [0, 0, 0, 2],
  }

  const anchorBard0001: PoetBlockAnchor = {
    ...anchorPoet0001,
    prefix: PREFIX_BARD,
  }

  const anchorBard0002: PoetBlockAnchor = {
    ...anchorBard0001,
    version: [0, 0, 0, 2],
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
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_POET, [0, 0, 0, 1])),
    expected: [anchorPoet0001, anchorPoet0001b],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, [0, 0, 0, 1])),
    expected: [anchorBard0001],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_POET, [0, 0, 0, 2])),
    expected: [anchorPoet0002],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, [0, 0, 0, 2])),
    expected: [anchorBard0002],
  })

  assert({
    given,
    should: 'return only the ones matching prefix and version',
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, [0, 0, 0, 3])),
    expected: [],
  })
})

describe('Bitcoin.bufferToPoetAnchor', async assert => {
  function assertSample(
    prefix: string,
    version: number[],
    storageProtocol: StorageProtocol,
    ipfsDirectoryHash: string
  ) {
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

  assertSample('POET', [2, 3], StorageProtocol.IPFS, 'Jim')
  assertSample('BARD', [2, 3], StorageProtocol.IPFS, 'Robert')
  assertSample('POET', [1, 0], StorageProtocol.IPFS, 'Roger')
  assertSample('BARD', [1, 0], StorageProtocol.IPFS, 'Syd')
})

describe('Bitcoin.bufferToPoetAnchor', async assert => {
  const bufferFromAnchor = (
    prefix: string,
    version: number[],
    storageProtocol: StorageProtocol,
    ipfsDirectoryHash: string
  ): Buffer =>
    Buffer.from(
      poetAnchorToData({
        prefix,
        version,
        storageProtocol,
        ipfsDirectoryHash,
      }),
      'hex'
    )

  assert({
    given: 'Buffer from correct poet anchor with IPFS file hash',
    should: 'return true',
    actual: isCorrectBufferLength(
      bufferFromAnchor('POET', [2, 3], StorageProtocol.IPFS, 'QmPth96BuMUhHJDDiTNL6wphBMCXQWTDmm1uQe63VeGmPT')
    ),
    expected: true,
  })

  assert({
    given: 'Buffer from correct poet anchor with IPFS directory hash',
    should: 'return true',
    actual: isCorrectBufferLength(
      bufferFromAnchor('POET', [2, 3], StorageProtocol.IPFS, 'Qmdrv2VoXKpzpSzS1iKpWMxfM9THEhGgBriKqbMyAiTF1U')
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
  (block: any) => block.tx.length === 146,
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

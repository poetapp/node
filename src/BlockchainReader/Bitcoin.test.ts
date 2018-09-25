import { PoetBlockAnchor } from '@po.et/poet-js'
import { allPass, equals } from 'ramda'
import { describe } from 'riteway'

import { PREFIX_POET, PREFIX_BARD } from 'Helpers/Bitcoin'

import { anchorPrefixAndVersionMatch, blockToPoetAnchors } from './Bitcoin'

import * as TestBlock from './TestData/block-00000000000151360aad32397ff1cf7dd303bed163b0ef425e71a53ccdec7312.json'

describe('Bitcoin.blockToPoetAnchors', async should => {
  const { assert } = should()

  assert({
    given: 'testnet block 1356137',
    should: 'satisfy basic integrity checks',
    actual: validateTestBlockIntegrity(TestBlock),
    expected: true,
  })

  const ipfsDirectoryHashes = [
    'QmSGQKnfG98KrpxNpZMhNyAKkvxudGqKhGeGv13zSXLQwz',
    'QmSicKkyyb5NJqSJ9EaaMJWQvqa4e3CX7psjjnRxvgfodv',
    'QmTrtzm1fvysZgsGhJicTrdJ1vSbi3UuLWBiHAMYBkcQfL',
    'QmaXCvSA4noYsJruubE8cYUtu3gPAmgL9aosFzDdrsviWJ',
    'QmYMHmt9H37gqwDMd4yYrt99cDRJxHpwVATKWYGbYNWncp',
  ]

  {
    const poetAnchors = blockToPoetAnchors(TestBlock as any) // as any: see footer note

    const isBardAnchor = (poetAnchor: PoetBlockAnchor) => poetAnchor.prefix === PREFIX_BARD
    const anchorIsVersion0003 = (poetAnchor: PoetBlockAnchor) => equals(poetAnchor.version, [0, 0, 0, 3])
    const anchorIsBlockHash = (poetAnchor: PoetBlockAnchor) => poetAnchor.blockHash === TestBlock.hash
    const anchorIsBlockHeight = (poetAnchor: PoetBlockAnchor) => poetAnchor.blockHeight === TestBlock.height
    const anchorHasUnexpectedIpfsHash = (poetAnchor: PoetBlockAnchor) =>
      !ipfsDirectoryHashes.includes(poetAnchor.ipfsDirectoryHash)

    const anchorsIpfsHashes = poetAnchors.map(poetAnchor => poetAnchor.ipfsDirectoryHash)

    const given = 'a test block with Po.et anchors'

    assert({
      given,
      should: 'return 5 Po.et Anchors',
      actual: poetAnchors.length,
      expected: 5,
    })

    assert({
      given,
      should: 'return prefix BARD anchors only',
      actual: poetAnchors.filter(isBardAnchor).length,
      expected: poetAnchors.length,
    })

    assert({
      given,
      should: 'return version 0.0.0.3 anchors only',
      actual: poetAnchors.filter(anchorIsVersion0003).length,
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
})

describe('Bitcoin.getMatchingAnchors', async should => {
  const { assert } = should('return only the ones matching prefix and version')

  const anchorPoet0001: PoetBlockAnchor = {
    transactionId: '0b801f8cc7bec11048b18d9591d35eb747cfcbd1945ad4a72d6baf8f74c7da2e',
    storageProtocol: 0,
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
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_POET, [0, 0, 0, 1])),
    expected: [anchorPoet0001, anchorPoet0001b],
  })

  assert({
    given,
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, [0, 0, 0, 1])),
    expected: [anchorBard0001],
  })

  assert({
    given,
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_POET, [0, 0, 0, 2])),
    expected: [anchorPoet0002],
  })

  assert({
    given,
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, [0, 0, 0, 2])),
    expected: [anchorBard0002],
  })

  assert({
    given,
    actual: anchors.filter(anchorPrefixAndVersionMatch(PREFIX_BARD, [0, 0, 0, 3])),
    expected: [],
  })
})

// Would be way better to validate the block's hash
const validateTestBlockIntegrity = allPass([
  (block: any) => block.tx,
  (block: any) => Array.isArray(block.tx),
  (block: any) => block.tx.length === 3517,
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

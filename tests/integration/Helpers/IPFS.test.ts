/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'
import { describe } from 'riteway'

import { IPFS } from '../../../src/Helpers/IPFS'
import {
  allAsciiCharactersClaim,
  nonAsciiCharactersClaim,
  longWithNonAsciiCharactersClaim,
} from '../../fixtures/claimData'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

const createIPFS = ({ url = IPFS_URL } = {}) => {
  return IPFS({
    url,
  })
}

const fetchFile = async (hash: string): Promise<string> => {
  const response = await fetch(`${IPFS_URL}/api/v0/cat?arg=${hash}`)
  return response.text()
}

describe('IPFS.addText', async assert => {
  {
    const ipfs = createIPFS()
    const claim = allAsciiCharactersClaim
    const hash = await ipfs.addText()(JSON.stringify(claim))
    const claimFromIPFS = JSON.parse(await fetchFile(hash))

    assert({
      given: 'a claim that only contains ascii characters',
      should: 'match the claim read from ipfs',
      actual: claimFromIPFS,
      expected: claim,
    })
  }

  {
    const ipfs = createIPFS()
    const claim = nonAsciiCharactersClaim
    const hash = await ipfs.addText()(JSON.stringify(claim))
    const claimFromIPFS = JSON.parse(await fetchFile(hash))

    assert({
      given: 'a claim that contains non-ascii characters',
      should: 'match the claim read from ipfs',
      actual: claimFromIPFS,
      expected: claim,
    })
  }

  {
    const ipfs = createIPFS()
    const claim = longWithNonAsciiCharactersClaim
    const hash = await ipfs.addText()(JSON.stringify(claim))
    const claimFromIPFS = JSON.parse(await fetchFile(hash))

    assert({
      given: 'a longer claim that contains non-ascii characters',
      should: 'match the claim read from ipfs',
      actual: claimFromIPFS,
      expected: claim,
    })
  }
})

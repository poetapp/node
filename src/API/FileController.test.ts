import { describe } from 'riteway'
import { convertJson } from './FileController'

describe('convertJson', async assert => {
  {
    const input = {
      Hash: 'something',
      Name: 'foo',
      Other: 'bar',
    }

    const ipfsUrlPrefix = 'https://ipfs.io/ipfs'

    assert({
      given: 'an ipfsUrlPrefix, then an ipfs response',
      should: 'convert it to the correct response',
      actual: convertJson(ipfsUrlPrefix)(input),
      expected: { hash: 'something', archiveUrl: 'https://ipfs.io/ipfs/something' },
    })
  }
})

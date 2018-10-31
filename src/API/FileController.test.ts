import { describe } from 'riteway'
import { convertJson } from './FileController'

describe('convertJson', async assert => {
  {
    const input = {
      Hash: 'something',
      Name: 'foo',
      Other: 'bar',
    }
    assert({
      given: 'an ipfs response',
      should: 'convert it to the correct response',
      actual: convertJson(input),
      expected: { hash: input.Hash },
    })
  }
})

/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'

import { TheRaven } from '../tests/helpers/Claims'
import { isClaimIPFSHashPair } from './Interfaces'

const ipfsFileHash = ''

describe('Interfaces isClaimIPFSHashPair', async (assert: any) => {
  {
    assert({
      given: 'an input without the required object properties',
      should: 'return false',
      actual: isClaimIPFSHashPair({}),
      expected: false,
    })
  }

  {
    assert({
      given: 'an input with empty string',
      should: 'return false',
      actual: isClaimIPFSHashPair(''),
      expected: false,
    })
  }

  {
    assert({
      given: 'an input object with just the valid claim',
      should: 'return false',
      actual: isClaimIPFSHashPair({ claim: TheRaven }),
      expected: false,
    })
  }

  {
    assert({
      given: 'an input object with just the ipfsFileHash',
      should: 'return false',
      actual: isClaimIPFSHashPair({ ipfsFileHash }),
      expected: false,
    })
  }

  {
    assert({
      given: 'an input object with a valid claim and ipfsFileHash',
      should: 'return true',
      actual: isClaimIPFSHashPair({ claim: TheRaven, ipfsFileHash }),
      expected: true,
    })
  }
})

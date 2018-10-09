/* tslint:disable:no-relative-imports */
import { describe } from 'riteway'
import { isClaimIPFSHashPair } from './Interfaces'

const claim = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature:
    '3045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed91034',
  type: 'Work',
  created: '2017-11-13T15:00:00.000Z',
  attributes: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    text: 'Once upon a midnight dreary...',
  },
}

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
      actual: isClaimIPFSHashPair({ claim }),
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
      actual: isClaimIPFSHashPair({ claim, ipfsFileHash }),
      expected: true,
    })
  }
})

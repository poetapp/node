import { describe } from 'riteway'

import { IPFS } from './IPFS'
import { IPFSConfiguration } from './IPFSConfiguration'

describe('IPFS', async (should: any) => {
  const { assert } = should('')

  const IPFSConfiguration: IPFSConfiguration = {
    ipfsUrl: '',
    downloadTimeoutInSeconds: 1,
  }

  {
    const ipfs = new IPFS(IPFSConfiguration)

    assert({
      given: 'the new instance of IPFS',
      should: 'be an instance of IPFS',
      actual: ipfs instanceof IPFS,
      expected: true,
    })
  }
})

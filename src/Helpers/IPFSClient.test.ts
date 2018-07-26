import * as IPFSFactory from 'ipfsd-ctl'
import { describe } from 'riteway'
import { IPFS } from './IPFSClient';

const port = 5001
const ipfsUrl = `http://localhost:${port}`;

const newServer = () => {
  return IPFSFactory.createServer({ port })
}

const newIPFS = () => {
  return new IPFS({ ipfsUrl })
}

describe('IPFSClient()', async (should: any) => {
  const { assert } = should('')

  {
    const ipfs = newIPFS();
    const text = 'foooooooo'
    const result = await ipfs.addText(text);

    assert({
      given: 'test',
      should: 'store the text in ipfs',
      expected: 'string',
      actual: result
    })
  }

  // {
  //   const server = newServer();
    

  //   server.start(async (err: any) => {
  //     if (err) { 
  //       console.log('dfs', err)
  //       throw err
  //     }
      

  //     try {
  //     const result = await ipfs.createEmptyDirectory();
      

  //     assert({
  //       given: 'test',
  //       should: 'store the text in ipfs',
  //       expected: 'foo',
  //       actual: result
  //     })
  //   }
  //     catch(err) {
  //       console.log('ummm', JSON.stringify(err));
  //     }

  //     server.stop((err: any) => {
  //       if (err) { throw err }

  //     })
  //   })
  // }
})




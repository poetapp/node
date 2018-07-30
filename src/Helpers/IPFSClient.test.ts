import { IPFS } from './IPFSClient';

const port = 5001
const ipfsUrl = `http://localhost:${port}`;

const ipfs = new IPFS({ ipfsUrl })

const run = async () => {
  const text = 'foooooooo'
  const addTextResult = await ipfs.addText(text);
  console.log('addTextResult', addTextResult);

  const catResult = await ipfs.cat(addTextResult.hash)
  console.log('catResult', catResult)

  const emptyDirectory = await ipfs.createEmptyDirectory()
  console.log('emptyDirectory', emptyDirectory)

  const ls = await ipfs.ls('QmcGcrtDGWvij6mmv5Uyqod1ddmycxX1MWKk5VLp8QJTkx')
  console.log('ls', ls)

  const addFileToDirectory = await ipfs.addFileToDirectory(emptyDirectory.hash, addTextResult.hash, addTextResult.hash)
  console.log('addFileToDirectory', addFileToDirectory)
}

run()



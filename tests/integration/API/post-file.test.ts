/* tslint:disable:no-relative-imports */
import * as fs from 'fs'
import { prop } from 'ramda'
import { describe } from 'riteway'
import { configurePostFileStream } from '../../helpers/files'
import { configureFetchFile } from '../../helpers/ipfs'
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'
import * as path from 'path'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

const fetchIPFSFile = configureFetchFile({ ipfs: { url: IPFS_URL } })
const postFileStream = configurePostFileStream(NODE_PORT)

const getResponseHash = prop('hash')

const files = {
  loremIpsumText: path.resolve(__dirname, '../../fixtures/files/text-english.txt'),
}

describe('POST /files', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  {
    const given = 'a basic text file and post request'
    const should = 'return a hash that can be used to verify the file'
    const file = fs.readFileSync(files.loremIpsumText).toString()
    const fileStream = fs.createReadStream(files.loremIpsumText)

    try {
      const postResponse = await postFileStream(fileStream)
      const getResponse = await fetchIPFSFile(getResponseHash(postResponse))

      assert({
        given,
        should,
        actual: getResponse,
        expected: file,
      })
    } catch (error) {
      assert({
        given,
        should,
        actual: error,
        expected: file,
      })
    }
  }

  await server.stop()
  await db.teardown()
})

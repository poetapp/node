/* tslint:disable:no-relative-imports */
import { asyncPipe } from 'Helpers/async-pipe'
import * as fs from 'fs'
import * as path from 'path'
import { prop, identity, head } from 'ramda'
import { describe } from 'riteway'

import { configurePostFileStream, getResponseJson } from '../../helpers/files'
import { configureFetchFile } from '../../helpers/ipfs'
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

const fetchIPFSFile = configureFetchFile()
const postFileStream = configurePostFileStream(NODE_PORT)

const getHash = prop('Hash')
const getStatus = prop('status')

type calcPath = (relPath: string) => string
const calcPath: calcPath = relPath => path.resolve(__dirname, relPath)

const files = {
  utf8Markdown: calcPath('../../fixtures/files/utf8.md'),
}

const trace = (label: any) => (value: any) => {
  console.log()
  console.log(label, value)
  console.log()
  return value;
}

const testResponseHash = asyncPipe(
  fs.createReadStream,
  postFileStream,
  getResponseJson,
  head,
  getHash,
  fetchIPFSFile,
)

const testResponseStatusCode = asyncPipe(
  fs.createReadStream,
  postFileStream,
  getStatus
)

describe('POST /files', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })
  {
    const given = 'a utf8 mardown file as a multipart file stream'

    assert({
      given,
      should: 'return a hash that can be used to verify the file',
      actual: await testResponseHash(files.utf8Markdown).catch(identity),
      expected: fs.readFileSync(files.utf8Markdown).toString(),
    })

    assert({
      given,
      should: 'return the correct status',
      actual: await testResponseStatusCode(files.utf8Markdown).catch(identity),
      expected: 200,
    })
  }

  await server.stop()
  await db.teardown()
})

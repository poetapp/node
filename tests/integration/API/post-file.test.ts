/* tslint:disable:no-relative-imports */
import * as fs from 'fs'
import * as path from 'path'
import { prop, pipeP, identity } from 'ramda'
import { describe, Try } from 'riteway'
import { configurePostFileStream, getResponseJson } from '../../helpers/files'
import { configureFetchFile } from '../../helpers/ipfs'
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

const fetchIPFSFile = configureFetchFile({ ipfs: { url: IPFS_URL } })
const postFileStream = configurePostFileStream(NODE_PORT)

const getHash = prop('hash')

type toPromise = <A, B>(fn?: (a: A) => B) => (v: A) => Promise<B>
const toPromise: toPromise = (fn = identity) => v => Promise.resolve(fn(v))

type calcPath = (relPath: string) => string
const calcPath: calcPath = relPath => path.resolve(__dirname, relPath)

const files = {
  utf8Markdown: calcPath('../../fixtures/files/utf8.md'),
}

const getResponseJSONHash = pipeP(getResponseJson, toPromise(getHash))

const testResponseHash = pipeP(postFileStream, getResponseJSONHash, fetchIPFSFile)

describe('POST /files', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  {
    const expected = fs.readFileSync(files.utf8Markdown).toString()
    const fileStream = fs.createReadStream(files.utf8Markdown)

    assert({
      given: 'a utf8 mardown file',
      should: 'return a hash that can be used to verify the file',
      actual: Try(testResponseHash, fileStream),
      expected,
    })
  }

  await server.stop()
  await db.teardown()
})

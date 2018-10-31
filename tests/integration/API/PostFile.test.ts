/* tslint:disable:no-relative-imports */
import { asyncPipe } from 'Helpers/asyncPipe'
import * as fs from 'fs'
import * as path from 'path'
import { prop, identity, head, map } from 'ramda'
import { describe } from 'riteway'

import { FileHelper } from '../../helpers/files'
import { IPFS } from '../../helpers/ipfs'
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'

const ipfs = IPFS()
const fileHelper = FileHelper({ port: NODE_PORT  })

const getHash = prop('hash')
const getStatus = prop('status')

const calcPath = (relPath: string) => path.resolve(__dirname, relPath)

const files = {
  utf8Markdown: calcPath('../../fixtures/files/utf8.md'),
}

const testResponseHashes = asyncPipe(
  map(fs.createReadStream),
  fileHelper.postFileStreams,
  (x) => x.json(),
  map(getHash),
  map(ipfs.fetchFileContent),
  Promise.all.bind(Promise),
)

const testStatusCode = asyncPipe(map(fs.createReadStream), fileHelper.postFileStreams, getStatus)

describe('POST /files', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  {
    const given = 'a single utf8 markdown file as a multipart file stream'

    assert({
      given,
      should: 'return a hash that can be used to verify the file',
      actual: await testResponseHashes([files.utf8Markdown]).catch(identity),
      expected: [fs.readFileSync(files.utf8Markdown).toString()],
    })

    assert({
      given,
      should: 'return the correct status',
      actual: await testStatusCode([files.utf8Markdown]).catch(identity),
      expected: 200,
    })
  }

  await server.stop()
  await db.teardown()
})

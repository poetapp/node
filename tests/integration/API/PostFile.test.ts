/* tslint:disable:no-relative-imports */
import { asyncPipe } from 'Helpers/asyncPipe'
import * as FormData from 'form-data'
import * as fetch from 'node-fetch'
import * as path from 'path'
import { prop, identity, head, map, view, lensPath } from 'ramda'
import { describe } from 'riteway'

import { utf8Markdown } from '../../fixtures/file-text'
import { getResponseText } from '../../helpers/fetch'
import { FileHelper } from '../../helpers/files'
import { IPFS } from '../../helpers/ipfs'
import { runtimeId, setUpServerAndDb } from '../../helpers/utils'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'

const IPFS_ARCHIVE_URL_PREFIX = process.env.IPFS_ARCHIVE_URL_PREFIX || 'https://ipfs.io/ipfs'

const ipfs = IPFS()
const fileHelper = FileHelper({ port: NODE_PORT  })

const getHash = prop('hash')
const getArchiveUrl  = prop('archiveUrl')
const getStatus = prop('status')

const status = lensPath(['status'])

const testResponseHashes = asyncPipe(
  fileHelper.postStringStreams,
  (x) => x.json(),
  map(getHash),
  map(ipfs.fetchFileContent),
  Promise.all.bind(Promise),
)

const testArchiveUrl = asyncPipe(
  fileHelper.postStringStreams,
  (x) => x.json(),
  map(getArchiveUrl),
  Promise.all.bind(Promise),
)

const testStatusCode = asyncPipe(fileHelper.postStringStreams, getStatus)

describe('POST /files', async assert => {
  // Setup Mongodb and the app server
  const { db, server } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  {
    const given = 'a single utf8 markdown file as a multipart file stream'

    assert({
      given,
      should: 'return a hash that can be used to verify the file',
      actual: await testResponseHashes([utf8Markdown]).catch(identity),
      expected: [utf8Markdown],
    })

    assert({
      given,
      should: 'return an archiveUrl for the file',
      actual: await testArchiveUrl([utf8Markdown]).catch(identity),
      expected: [`${IPFS_ARCHIVE_URL_PREFIX}/QmPCJLnAR1eTxcSTz6fXf9LZ5MecgatTkut93RtiYRCKq1`],
    })

    assert({
      given,
      should: 'return the correct status',
      actual: await testStatusCode([utf8Markdown]).catch(identity),
      expected: 200,
    })
  }

  {
    const given = 'no files in multipart form data'

    const formData = new FormData()
    const response = await fileHelper.postFile(formData).catch(identity)
    const responseText = await getResponseText(response).catch(identity)

    assert({
      given,
      should: 'return status of 400',
      actual: view(status, response),
      expected: 400,
    })

    assert({
      given,
      should: 'return a message that describes the issue with the request',
      actual: responseText,
      expected: 'No file found.',
    })
  }
  await server.stop()
  await db.teardown()
})

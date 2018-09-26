/* tslint:disable:no-relative-imports */
import { pick } from 'ramda'
import { describe } from 'riteway'
import { loadConfigurationWithDefaults, mergeConfigs } from './Configuration'

const defaultConfig = mergeConfigs()

describe('src/Configuration', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'no arguments',
    should: 'return the default config',
    actual: mergeConfigs(),
    expected: defaultConfig,
  })

  {
    const stringOverride = { MONGODB_HOST: 'one' }

    assert({
      given: 'a string override',
      should: 'return a config containing the string value',
      actual: mergeConfigs(stringOverride),
      expected: {
        ...defaultConfig,
        mongodbHost: 'one',
        mongodbUrl: 'mongodb://one:27017/poet',
      },
    })
  }

  {
    const numberOverride = { BATCH_CREATION_INTERVAL_IN_SECONDS: '10' }

    assert({
      given: 'a numerical value as a string override',
      should: 'return a config containing the numeric value',
      actual: mergeConfigs(numberOverride),
      expected: { ...defaultConfig, batchCreationIntervalInSeconds: 10 },
    })
  }

  // TODO: This is here to support using either MONGODB_URL or MONGO_HOST, MONGO_PORT, etc.
  // Remove this once local-dev switches over to using the individual env vars.
  {
    {
      const mongodbOverrides = {
        MONGODB_USER: 'dylan',
        MONGODB_PASSWORD: 'p1960s',
        MONGODB_DATABASE: 'poet-test-integration',
      }

      assert({
        given: 'a mongodb user override',
        should: 'return a config containing a mongodbUrl with auth info',
        actual: mergeConfigs(mongodbOverrides),
        expected: {
          ...defaultConfig,
          mongodbUser: 'dylan',
          mongodbPassword: 'p1960s',
          mongodbDatabase: 'poet-test-integration',
          mongodbUrl: 'mongodb://dylan:p1960s@localhost:27017/poet-test-integration',
        },
      })
    }

    {
      const mongodbOverrides = {
        MONGODB_URL: 'foo/bar',
      }

      assert({
        given: 'a mongodb url override',
        should: 'return a config using the override',
        actual: mergeConfigs(mongodbOverrides),
        expected: {
          ...defaultConfig,
          mongodbUrl: 'foo/bar',
        },
      })
    }
  }
})

describe('loadConfigurationWithDefaults', async (should: any) => {
  const { assert } = should()
  const mongodbOverrides = {
    API_PORT: '4321',
  }

  assert({
    given: 'a local configuration override',
    should: 'return a config using the local override',
    actual: loadConfigurationWithDefaults(mongodbOverrides),
    expected: {
      ...defaultConfig,
      apiPort: 4321,
    },
  })
})

describe('src/Configuration RabbitmqExchangeMessages', async (should: any) => {
  const { assert } = should()

  {
    const defaultValues = {
      batchReaderReadNextDirectoryRequest: 'BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
      batchReaderReadNextDirectorySuccess: 'BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
      batchWriterCreateNextBatchRequest: 'BATCH_WRITER::CREATE_NEXT_BATCH_REQUEST',
      batchWriterCreateNextBatchSuccess: 'BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',
      newClaim: 'NEW_CLAIM',
      claimIpfsHash: 'CLAIM_IPFS_HASH',
      ipfsHashTxId: 'IPFS_HASH_TX_ID',
      poetAnchorDownloaded: 'POET_ANCHOR_DOWNLOADED',
      claimsDownloaded: 'CLAIMS_DOWNLOADED',
    }

    const keys = Object.keys(defaultValues)
    const actual = pick(keys, defaultConfig)
    const expected = defaultValues

    assert({
      given: 'no arguments',
      should: 'return the default config',
      actual,
      expected,
    })
  }

  {
    const overrideValues = {
      BATCH_READER_READ_NEXT_DIRECTORY_REQUEST: 'override',
      BATCH_READER_READ_NEXT_DIRECTORY_SUCCESS: 'override',
      BATCH_WRITER_CREATE_NEXT_BATCH_REQUEST: 'override',
      BATCH_WRITER_CREATE_NEXT_BATCH_SUCCESS: 'override',
      NEW_CLAIM: 'override',
      CLAIM_IPFS_HASH: 'override',
      IPFS_HASH_TX_ID: 'override',
      POET_ANCHOR_DOWNLOADED: 'override',
      CLAIMS_DOWNLOADED: 'override',
    }

    const expected = {
      batchReaderReadNextDirectoryRequest: 'override',
      batchReaderReadNextDirectorySuccess: 'override',
      batchWriterCreateNextBatchRequest: 'override',
      batchWriterCreateNextBatchSuccess: 'override',
      newClaim: 'override',
      claimIpfsHash: 'override',
      ipfsHashTxId: 'override',
      poetAnchorDownloaded: 'override',
      claimsDownloaded: 'override',
    }

    const keys = Object.keys(expected)
    const actual = pick(keys, mergeConfigs(overrideValues))

    assert({
      given: 'override default values',
      should: 'return the new config',
      actual,
      expected,
    })
  }
})

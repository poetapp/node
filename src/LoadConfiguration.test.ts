/* tslint:disable:no-relative-imports */
import { pick } from 'ramda'
import { describe, Try } from 'riteway'
import {
  loadConfigurationWithDefaults,
  mergeConfigs,
  applyExchangePrefix,
  extractValue,
  validatePoetVersion,
  validatePoetNetwork,
} from './LoadConfiguration'

const defaultConfig = mergeConfigs()

describe('src/LoadConfiguration', async assert => {
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

describe('loadConfigurationWithDefaults', async assert => {
  const mongodbOverrides = {
    API_PORT: '4321',
    ENABLE_ANCHORING: 'true',
    RABBITMQ_URL: 'foo',
  }

  const withoutLocalOverrides = loadConfigurationWithDefaults()

  assert({
    given: 'a local configuration override',
    should: 'return a config using the local override',
    actual: loadConfigurationWithDefaults(mongodbOverrides),
    expected: {
      ...withoutLocalOverrides,
      apiPort: 4321,
      enableAnchoring: true,
      rabbitmqUrl: 'foo',
    },
  })

  {
    const overrideValues = {
      EXCHANGE_PREFIX: 'myPrefix',
    }

    const expected = {
      exchangeBatchReaderReadNextDirectoryRequest: 'myPrefix.BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
      exchangeBatchReaderReadNextDirectorySuccess: 'myPrefix.BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
      exchangeBatchWriterCreateNextBatchRequest: 'myPrefix.BATCH_WRITER::CREATE_NEXT_BATCH_REQUEST',
      exchangeBatchWriterCreateNextBatchSuccess: 'myPrefix.BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',
      exchangeNewClaim: 'myPrefix.NEW_CLAIM',
      exchangeClaimIpfsHash: 'myPrefix.CLAIM_IPFS_HASH',
      exchangeIpfsHashTxId: 'myPrefix.IPFS_HASH_TX_ID',
      exchangePoetAnchorDownloaded: 'myPrefix.POET_ANCHOR_DOWNLOADED',
      exchangeClaimsDownloaded: 'myPrefix.CLAIMS_DOWNLOADED',
      exchangeClaimsNotDownloaded: 'myPrefix.CLAIMS_NOT_DOWNLOADED',
      exchangeStorageWriterStoreNextClaim: 'myPrefix.STORAGE_WRITER::STORE_NEXT_CLAIM',
      exchangeGetHealth: 'myPrefix.HEALTH::GET_HEALTH',
    }
    const keys = Object.keys(expected)
    const actual = pick(keys, loadConfigurationWithDefaults(overrideValues))

    assert({
      given: 'override default values with an EXCHANGE_PREFIX',
      should: 'return exchange names with the prefix prepended',
      actual,
      expected,
    })
  }
})

describe('src/LoadConfiguration RabbitmqExchangeMessages', async assert => {
  {
    const defaultValues = {
      exchangeBatchReaderReadNextDirectoryRequest: 'BATCH_READER::READ_NEXT_DIRECTORY_REQUEST',
      exchangeBatchReaderReadNextDirectorySuccess: 'BATCH_READER::READ_NEXT_DIRECTORY_SUCCESS',
      exchangeBatchWriterCreateNextBatchRequest: 'BATCH_WRITER::CREATE_NEXT_BATCH_REQUEST',
      exchangeBatchWriterCreateNextBatchSuccess: 'BATCH_WRITER::CREATE_NEXT_BATCH_SUCCESS',
      exchangeNewClaim: 'NEW_CLAIM',
      exchangeClaimIpfsHash: 'CLAIM_IPFS_HASH',
      exchangeIpfsHashTxId: 'IPFS_HASH_TX_ID',
      exchangePoetAnchorDownloaded: 'POET_ANCHOR_DOWNLOADED',
      exchangeClaimsDownloaded: 'CLAIMS_DOWNLOADED',
      exchangeClaimsNotDownloaded: 'CLAIMS_NOT_DOWNLOADED',
      exchangeGetHealth: 'HEALTH::GET_HEALTH',
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
      EXCHANGE_BATCH_READER_READ_NEXT_DIRECTORY_REQUEST: 'override',
      EXCHANGE_BATCH_READER_READ_NEXT_DIRECTORY_SUCCESS: 'override',
      EXCHANGE_BATCH_WRITER_CREATE_NEXT_BATCH_REQUEST: 'override',
      EXCHANGE_BATCH_WRITER_CREATE_NEXT_BATCH_SUCCESS: 'override',
      EXCHANGE_NEW_CLAIM: 'override',
      EXCHANGE_CLAIM_IPFS_HASH: 'override',
      EXCHANGE_IPFS_HASH_TX_ID: 'override',
      EXCHANGE_POET_ANCHOR_DOWNLOADED: 'override',
      EXCHANGE_CLAIMS_DOWNLOADED: 'override',
      EXCHANGE_CLAIMS_NOT_DOWNLOADED: 'override',
      EXCHANGE_GET_HEALTH: 'override',
    }

    const expected = {
      exchangeBatchReaderReadNextDirectoryRequest: 'override',
      exchangeBatchReaderReadNextDirectorySuccess: 'override',
      exchangeBatchWriterCreateNextBatchRequest: 'override',
      exchangeBatchWriterCreateNextBatchSuccess: 'override',
      exchangeNewClaim: 'override',
      exchangeClaimIpfsHash: 'override',
      exchangeIpfsHashTxId: 'override',
      exchangePoetAnchorDownloaded: 'override',
      exchangeClaimsDownloaded: 'override',
      exchangeClaimsNotDownloaded: 'override',
      exchangeGetHealth: 'override',
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

describe('src/LoadConfiguration applyExchangePrefix', async assert => {
  {
    const actual = { exchangePrefix: '' }

    const expected = applyExchangePrefix(actual)

    assert({
      given: 'configVars with the property exchangePrefix with empty string',
      should: 'return the same object configVars',
      actual,
      expected,
    })
  }

  {
    const configVars = {
      exchangePrefix: 'prefix',
      exchangeAnchorNextHashRequest: 'exchangeAnchorNextHashRequest',
      exchangeBatchReaderReadNextDirectoryRequest: 'exchangeBatchReaderReadNextDirectoryRequest',
      exchangeBatchReaderReadNextDirectorySuccess: 'exchangeBatchReaderReadNextDirectorySuccess',
      exchangeBatchWriterCreateNextBatchRequest: 'exchangeBatchWriterCreateNextBatchRequest',
      exchangeBatchWriterCreateNextBatchSuccess: 'exchangeBatchWriterCreateNextBatchSuccess',
      exchangeNewClaim: 'exchangeNewClaim',
      exchangeClaimIpfsHash: 'exchangeClaimIpfsHash',
      exchangeIpfsHashTxId: 'exchangeIpfsHashTxId',
      exchangePoetAnchorDownloaded: 'exchangePoetAnchorDownloaded',
      exchangeClaimsDownloaded: 'exchangeClaimsDownloaded',
      exchangeClaimsNotDownloaded: 'exchangeClaimsNotDownloaded',
      exchangeStorageWriterStoreNextClaim: 'exchangeStorageWriterStoreNextClaim',
      exchangeGetHealth: 'exchangeGetHealth',
      exchangePurgeStaleTransactions: 'exchangePurgeStaleTransactions',
      exchangeForkDetected: 'exchangeForkDetected',
    }

    const actual = applyExchangePrefix(configVars)

    const expected = {
      exchangePrefix: 'prefix',
      exchangeAnchorNextHashRequest: 'prefix.exchangeAnchorNextHashRequest',
      exchangeBatchReaderReadNextDirectoryRequest: 'prefix.exchangeBatchReaderReadNextDirectoryRequest',
      exchangeBatchReaderReadNextDirectorySuccess: 'prefix.exchangeBatchReaderReadNextDirectorySuccess',
      exchangeBatchWriterCreateNextBatchRequest: 'prefix.exchangeBatchWriterCreateNextBatchRequest',
      exchangeBatchWriterCreateNextBatchSuccess: 'prefix.exchangeBatchWriterCreateNextBatchSuccess',
      exchangeNewClaim: 'prefix.exchangeNewClaim',
      exchangeClaimIpfsHash: 'prefix.exchangeClaimIpfsHash',
      exchangeIpfsHashTxId: 'prefix.exchangeIpfsHashTxId',
      exchangePoetAnchorDownloaded: 'prefix.exchangePoetAnchorDownloaded',
      exchangeClaimsDownloaded: 'prefix.exchangeClaimsDownloaded',
      exchangeClaimsNotDownloaded: 'prefix.exchangeClaimsNotDownloaded',
      exchangeStorageWriterStoreNextClaim: 'prefix.exchangeStorageWriterStoreNextClaim',
      exchangeGetHealth: 'prefix.exchangeGetHealth',
      exchangePurgeStaleTransactions: 'prefix.exchangePurgeStaleTransactions',
      exchangeForkDetected: 'prefix.exchangeForkDetected',
    }

    assert({
      given: 'configVars with the property exchangePrefix with a custom prefix',
      should: 'return the same object configVars with the custom prefix over the name of exchanges',
      actual,
      expected,
    })
  }
})

describe('src/LoadConfiguration extractValue', async assert => {
  {
    const actual = extractValue('false')
    const expected = false

    assert({
      given: 'false like as string',
      should: 'return false as boolean',
      actual,
      expected,
    })
  }

  {
    const actual = extractValue('true')
    const expected = true

    assert({
      given: 'true like as string',
      should: 'return true as boolean',
      actual,
      expected,
    })
  }
})

describe('src/LoadConfiguration validatePoetVersion', async assert => {
  {
    assert({
      given: 'an invalid Poet version -1',
      should: `return the message 'poetVersion must be an integer between 0 and 65535'`,
      actual: Try(validatePoetVersion, -1).message,
      expected: 'poetVersion must be an integer between 0 and 65535',
    })
  }

  {
    assert({
      given: 'an invalid Poet version 65536',
      should: `return the message 'poetVersion must be an integer between 0 and 65535'`,
      actual: Try(validatePoetVersion, 65536).message,
      expected: 'poetVersion must be an integer between 0 and 65535',
    })
  }
})

describe('src/LoadConfiguration validatePoetNetwork', async assert => {
  {
    assert({
      given: 'a string with more 4 letters as Poet Network',
      should: `return the message 'Field poetNetwork must have a length of 4'`,
      actual: Try(validatePoetNetwork, '12345').message,
      expected: 'Field poetNetwork must have a length of 4',
    })
  }
})

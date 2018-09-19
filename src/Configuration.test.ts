import { describe } from 'riteway'
import { mergeConfigs } from './Configuration'

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

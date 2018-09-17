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
    const stringOverride = { MONGODB_URL: 'one' }

    assert({
      given: 'a string override',
      should: 'return a config containing the string value',
      actual: mergeConfigs(stringOverride),
      expected: { ...defaultConfig, mongodbUrl: 'one' },
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
})

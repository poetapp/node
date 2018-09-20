import { describe } from 'riteway'

import { createEnvToConfigurationKeyMap } from './Configuration'

describe('createEnvToConfigurationKeyMap()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'empty array',
    should: 'return empty object',
    actual: createEnvToConfigurationKeyMap([]),
    expected: {},
  })

  {
    const defaultConfiguration = ['rabbitmqUrl', 'mongodbHost', 'otherTestKeyMultipleCapital']

    assert({
      given: 'array with cammelCase values',
      should: 'return object with ScreamingSnakeCase keys and equal cammelCase values',
      actual: createEnvToConfigurationKeyMap(defaultConfiguration),
      expected: {
        RABBITMQ_URL: 'rabbitmqUrl',
        MONGODB_HOST: 'mongodbHost',
        OTHER_TEST_KEY_MULTIPLE_CAPITAL: 'otherTestKeyMultipleCapital',
      },
    })
  }
})

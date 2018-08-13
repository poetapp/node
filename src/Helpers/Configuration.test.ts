import { describe } from 'riteway'
import { createEnvToConfigurationKeyMap } from './Configuration'

describe('createEnvToConfigurationKeyMap()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'empty object',
    should: 'return empty object',
    actual: createEnvToConfigurationKeyMap({}),
    expected: {}
  })

  {
    const defaultConfiguration = {
      rabbitmqUrl: 'testRabbit',
      mongodbUrl: 'testMongo',
      otherTestKeyMultipleCapital: 'testOtherTestKeyMultipleCapital',
    }

    assert({
      given: 'object with cammelCase keys',
      should: 'return object with ScreamingSnakeCase keys and equal cammelCase values',
      actual: createEnvToConfigurationKeyMap(defaultConfiguration),
      expected: {
        RABBITMQ_URL: 'rabbitmqUrl',
        MONGODB_URL: 'mongodbUrl',
        OTHER_TEST_KEY_MULTIPLE_CAPITAL: 'otherTestKeyMultipleCapital'
      }
    })
  }
})
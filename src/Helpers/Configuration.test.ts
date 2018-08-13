import { describe } from 'riteway'
import { createEnvToConfigurationKeyMap, toScreamingSnakeCase } from './Configuration'

describe('toScreamingSnakeCase()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'no arguments',
    should: 'return an empty string',
    actual: toScreamingSnakeCase(),
    expected: ''
  })

  assert({
    given: 'lowercase string',
    should: 'return an UPPERCASE string',
    actual: toScreamingSnakeCase('test'),
    expected: 'TEST'
  })

  assert({
    given: 'camelCase string',
    should: 'return SCREAMING_SNAKE_CASE string',
    actual: toScreamingSnakeCase('testCaseString'),
    expected: 'TEST_CASE_STRING'
  })
})

describe('createEnvToConfigurationKeyMap()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'no arguments',
    should: 'return empty object',
    actual: createEnvToConfigurationKeyMap(),
    expected: {}
  })

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
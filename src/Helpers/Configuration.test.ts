import { describe } from 'riteway'
import { createEnvToConfigurationKeyMap, toPair } from './Configuration'

describe('toPair()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'lowercase string',
    should: 'Array with CAPITALIZED string and lowercase string',
    actual: toPair('test'),
    expected: ['TEST', 'test']
  })

  assert({
    given: 'cammelCase string',
    should: 'Array with SCREAMING_SNAKE_CASE string and original string',
    actual: toPair('testStringCase'),
    expected: ['TEST_STRING_CASE', 'testStringCase' ]
  })
})


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
import { describe } from 'riteway'
import { createEnvToConfigurationKeyMap, ArrayKeyToScreamingSnakeCase } from './Configuration'

describe('ArrayKeyToScreamingSnakeCase()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'no arguments',
    should: 'return an empty array',
    actual: ArrayKeyToScreamingSnakeCase(),
    expected: []
  })
  {
    const array = ['test', 'string']
    assert({
      given: 'array of key value pair with lowerCase key',
      should: 'return array with capitalized key and original key',
      actual: ArrayKeyToScreamingSnakeCase(array),
      expected: ['TEST', 'test']
    })
  }
  {
    const array = ['testCase']
    assert({
      given: 'array with one camelCase element',
      should: 'return array with SCREAMING_SNAKE_CASE element and original element',
      actual: ArrayKeyToScreamingSnakeCase(array),
      expected: ['TEST_CASE', 'testCase']
    })
  }
  {
    const array = ['testCase', 'string', 'extraString']
    assert({
      given: 'array cammelCase first element',
      should: 'return array with SCREAMING_SNAKE_CASE first element and original first element',
      actual: ArrayKeyToScreamingSnakeCase(array),
      expected: ['TEST_CASE', 'testCase']
    })
  }
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
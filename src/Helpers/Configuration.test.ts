import { describe } from 'riteway'
import { keysToScreamingSnakeCase } from './Configuration'

describe('keysToScreamingSnakeCase()', async (should: any) => {
  const { assert } = should()

  assert({
    given: 'no arguments',
    should: 'return empty object',
    actual: keysToScreamingSnakeCase(),
    expected: {}
  })

  assert({
    given: 'empty object',
    should: 'return empty object',
    actual: keysToScreamingSnakeCase({}),
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
      actual: keysToScreamingSnakeCase(defaultConfiguration),
      expected: { 
        RABBITMQ_URL : 'rabbitmqUrl',
        MONGODB_URL: 'mongodbUrl',
        OTHER_TEST_KEY_MULTIPLE_CAPITAL: 'otherTestKeyMultipleCapital'
      }
    })
  }
})
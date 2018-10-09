import { describe } from 'riteway'
import { camelCaseToScreamingSnakeCase } from './camelCaseToScreamingSnakeCase'

describe('camelCaseToScreamingSnakeCase()', async (assert: any) => {
  assert({
    given: 'no arguments',
    should: 'return an empty string',
    actual: camelCaseToScreamingSnakeCase(),
    expected: '',
  })

  assert({
    given: 'empty string',
    should: 'return an empty string',
    actual: camelCaseToScreamingSnakeCase(''),
    expected: '',
  })

  assert({
    given: 'lowercase string',
    should: 'return an UPPERCASE string',
    actual: camelCaseToScreamingSnakeCase('test'),
    expected: 'TEST',
  })

  assert({
    given: 'camelCase string',
    should: 'return SCREAMING_SNAKE_CASE string',
    actual: camelCaseToScreamingSnakeCase('testCaseString'),
    expected: 'TEST_CASE_STRING',
  })
})

import { describe } from 'riteway'

import { isTruthy } from './isTruthy'

describe('isTruthy', async assert => {
  assert({
    given: 'null',
    should: 'return false',
    actual: isTruthy(null),
    expected: false,
  })

  assert({
    given: 'undefined',
    should: 'return false',
    actual: isTruthy(undefined),
    expected: false,
  })

  assert({
    given: 'an empty string',
    should: 'return false',
    actual: isTruthy(''),
    expected: false,
  })

  assert({
    given: 'a non-empty string',
    should: 'return true',
    actual: isTruthy('oh hi mark'),
    expected: true,
  })

  assert({
    given: 'an empty object',
    should: 'return true',
    actual: isTruthy({}),
    expected: true,
  })

  assert({
    given: 'the number zero',
    should: 'return false',
    actual: isTruthy(0),
    expected: false,
  })

  assert({
    given: 'the number forty two',
    should: 'return true',
    actual: isTruthy(42),
    expected: true,
  })

  assert({
    given: 'an empty array',
    should: 'return true',
    actual: isTruthy([]),
    expected: true,
  })
})

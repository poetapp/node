import { describe } from 'riteway'

import { isNotNil } from './isNotNil'

describe('isNotNil', async assert => {

  const returnTrue = 'return true'
  const returnFalse = 'return false'

  assert({
    given: 'an empty string',
    should: returnTrue,
    actual: isNotNil(''),
    expected: true,
  })

  assert({
    given: 'an empty array',
    should: returnTrue,
    actual: isNotNil([]),
    expected: true,
  })

  assert({
    given: 'an empty object',
    should: returnTrue,
    actual: isNotNil({}),
    expected: true,
  })

  assert({
    given: 'undefined',
    should: returnFalse,
    actual: isNotNil(undefined),
    expected: false,
  })

  assert({
    given: 'null',
    should: returnFalse,
    actual: isNotNil(null),
    expected: false,
  })

  assert({
    given: 'no value',
    should: returnFalse,
    actual: isNotNil(),
    expected: false,
  })
})

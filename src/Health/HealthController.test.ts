import { describe } from 'riteway'

import { isStatus200, isBalanceLow } from './HealthController'

describe('isStatus200()', async assert => {
  assert({
    given: 'object with status property equal to 200',
    should: 'return the correct boolean',
    actual: isStatus200({ status: 200 }),
    expected: true,
  })

  assert({
    given: 'object with status property not equal to 200',
    should: 'return the correct boolean',
    actual: isStatus200({ status: 2 }),
    expected: false,
  })
})

describe('isBalanceLow()', async assert => {
  assert({
    given: 'a balance above lowWalletBalanceBTC',
    should: 'return false',
    actual: isBalanceLow(2, 1),
    expected: false,
  })

  assert({
    given: 'a balance equal to lowWalletBalanceBTC',
    should: 'return false',
    actual: isBalanceLow(1, 1),
    expected: false,
  })

  assert({
    given: 'a balance below lowWalletBalanceBTC',
    should: 'return true',
    actual: isBalanceLow(1, 2),
    expected: true,
  })
})

import { describe } from 'riteway'

import { isOkOne, isStatus200 } from './HealthController'

describe('isOkOne()', async (assert: any) => {
  assert({
    given: 'object with ok property equal to 1',
    should: 'return the correct boolean',
    actual: isOkOne({ ok: 1 }),
    expected: true,
  })

  assert({
    given: 'object with ok property not equal to 1',
    should: 'return the correct boolean',
    actual: isOkOne({ ok: 2 }),
    expected: false,
  })
})

describe('isStatus200()', async (assert: any) => {
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

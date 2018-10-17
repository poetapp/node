import { describe } from 'riteway'

import { isStatus200 } from './HealthController'

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

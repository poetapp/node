import { describe } from 'riteway'

import { isOkOne } from './HealthController'

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

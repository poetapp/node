import { describe } from 'riteway'

import { NoMoreEntriesException } from './Exceptions'
import { isTraceError } from './Router'

describe('Router.isTraceError', async assert => {
  assert({
    given: 'a normal error',
    should: 'return the correct boolean',
    actual: isTraceError(new Error()),
    expected: false,
  })

  const traceErrors = [new NoMoreEntriesException()]

  traceErrors.map(err =>
    assert({
      given: 'a trace error',
      should: 'return the correct boolean',
      actual: isTraceError(err),
      expected: true,
    })
  )
})

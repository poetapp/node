import { describe } from 'riteway'

import { NoMoreEntriesException } from './Exceptions'
import { isTraceError } from './Router'

describe('Router.isTraceError', async should => {
  const { assert } = should('return the correct boolean')

  assert({
    given: 'a normal error',
    actual: isTraceError(new Error()),
    expected: false,
  })

  const traceErrors = [new NoMoreEntriesException()]

  traceErrors.map(err =>
    assert({
      given: 'a trace error',
      actual: isTraceError(err),
      expected: true,
    })
  )
})

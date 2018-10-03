import { describe } from 'riteway'

import { NoMoreEntriesException, isNoMoreEntriesException } from './Exceptions'

describe('Exceptions.isNoMoreEntriesException', async should => {
  const { assert } = should('return the correct boolean')
  assert({
    given: 'a normal error',
    actual: isNoMoreEntriesException(new Error()),
    expected: false,
  })
  assert({
    given: 'a NoMoreEntriesException error',
    actual: isNoMoreEntriesException(new NoMoreEntriesException()),
    expected: true,
  })
})

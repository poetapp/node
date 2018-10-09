import { describe } from 'riteway'

import { NoMoreEntriesException, isNoMoreEntriesException } from './Exceptions'

describe('Exceptions.isNoMoreEntriesException', async assert => {
  assert({
    given: 'a normal error',
    should: 'return the correct boolean',
    actual: isNoMoreEntriesException(new Error()),
    expected: false,
  })
  assert({
    given: 'a NoMoreEntriesException error',
    should: 'return the correct boolean',
    actual: isNoMoreEntriesException(new NoMoreEntriesException()),
    expected: true,
  })
})

import { NoMoreEntriesException } from 'Exceptions'
import 'Extensions/Error'
import { describe } from 'riteway'

describe('Exceptions NoMoreEntriesException', async (assert: any) => {
  const noMoreEntriesException = new NoMoreEntriesException('noMoreEntriesException')
  const parseError = JSON.parse(JSON.stringify(noMoreEntriesException))

  {
    const actual = parseError.message
    const expected = 'noMoreEntriesException'

    assert({
      given: 'a NoMoreEntriesException',
      should: 'be the message property noMoreEntriesException',
      actual,
      expected,
    })
  }
})

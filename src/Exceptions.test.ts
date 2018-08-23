import { NoMoreEntriesException } from 'Exceptions'
import 'Extensions/Error'
import { describe } from 'riteway'

describe('Exceptions NoMoreEntriesException', async (should: any) => {
  const { assert } = should('')
  const noMoreEntriesException = new NoMoreEntriesException('noMoreEntriesException')
  const parseError = JSON.parse(JSON.stringify(noMoreEntriesException))

  {
    assert({
      given: 'the new instance of NoMoreEntriesException',
      should: 'be an instance of NoMoreEntriesException',
      actual: noMoreEntriesException instanceof NoMoreEntriesException,
      expected: true,
    })
  }

  {
    const actual = parseError.type
    const expected = 'NoMoreEntriesException'

    assert({
      given: 'a NoMoreEntriesException',
      should: 'be the type property NoMoreEntriesException',
      actual,
      expected,
    })
  }

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

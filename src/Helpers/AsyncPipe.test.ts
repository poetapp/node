import { describe } from 'riteway'
import { asyncPipe } from './asyncPipe'

describe('asyncPipe', async (should: any) => {
  const { assert } = should('')

  {
    const inc = (num = 0) => Promise.resolve(num + 1)
    const actual = await asyncPipe(inc)(0)

    assert({
      given: 'a inc function like a promise',
      should: 'return the number 1',
      actual,
      expected: 1,
    })
  }
})

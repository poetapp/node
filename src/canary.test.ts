import { describe } from 'riteway'

const canSing = (gas: boolean) => !gas

describe('canary canSing()', async (should: any) => {
  const { assert } = should('')

  {
    const gasPresent = false

    assert({
      given: 'no gas in the coal mine',
      should: 'sing',
      actual: canSing(gasPresent),
      expected: true,
    })
  }

  {
    const gasPresent = true

    assert({
      given: 'gas in the coal mine',
      should: 'not sing',
      actual: canSing(gasPresent),
      expected: false,
    })
  }
})

import { describe } from 'riteway'
import { minutesToMiliseconds, secondsToMiliseconds } from './Time'

describe('Time minutesToMiliseconds()', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'minutesToMiliseconds(1)',
      should: 'be transform to 60000 Miliseconds',
      actual: minutesToMiliseconds(1),
      expected: 60000,
    })
  }
})

describe('Time secondsToMiliseconds()', async (should: any) => {
  const { assert } = should('')

  {
    assert({
      given: 'secondsToMiliseconds(1)',
      should: 'be transform to 60000 Miliseconds',
      actual: secondsToMiliseconds(1),
      expected: 1000,
    })
  }
})

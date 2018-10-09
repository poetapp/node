import { describe } from 'riteway'
import { minutesToMiliseconds, secondsToMiliseconds } from './Time'

describe('Time minutesToMiliseconds()', async (assert: any) => {
  {
    assert({
      given: 'minutesToMiliseconds(0)',
      should: 'be transform to 0 Miliseconds',
      actual: minutesToMiliseconds(0),
      expected: 0,
    })
  }

  {
    assert({
      given: 'minutesToMiliseconds(1)',
      should: 'be transform to 60000 Miliseconds',
      actual: minutesToMiliseconds(1),
      expected: 60000,
    })
  }

  {
    assert({
      given: 'minutesToMiliseconds(2)',
      should: 'be transform to 120000 Miliseconds',
      actual: minutesToMiliseconds(2),
      expected: 120000,
    })
  }
})

describe('Time secondsToMiliseconds()', async (assert: any) => {
  {
    assert({
      given: 'secondsToMiliseconds(0)',
      should: 'be transform to 0 Miliseconds',
      actual: secondsToMiliseconds(0),
      expected: 0,
    })
  }

  {
    assert({
      given: 'secondsToMiliseconds(1)',
      should: 'be transform to 1000 Miliseconds',
      actual: secondsToMiliseconds(1),
      expected: 1000,
    })
  }

  {
    assert({
      given: 'secondsToMiliseconds(2)',
      should: 'be transform to 2000 Miliseconds',
      actual: secondsToMiliseconds(2),
      expected: 2000,
    })
  }
})

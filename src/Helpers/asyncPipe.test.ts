import { identity, always } from 'ramda'
import { describe } from 'riteway'
import { asyncPipe } from './asyncPipe'
import { toPromise } from './to-promise'

const double = (x: number) => x * 2
const inc = (x: number) => x + 1
const fixedNum = always(20)

const doubleP = toPromise(double)
const incP = toPromise(inc)

const throwError = (message: string) => () => {
  throw message
}

describe('asyncPipe', async (assert: any) => {
  const should = 'apply the value to the functions composition correctly'

  {
    const value = 10
    assert({
      given: 'sync and async functions',
      should,
      actual: await asyncPipe(doubleP, inc)(value),
      expected: inc(await doubleP(value)),
    })
  }

  {
    const value = 10
    assert({
      given: 'nested compositions of sync and async functions',
      should,
      actual: await asyncPipe(doubleP, inc, asyncPipe(double, incP))(value),
      expected: await incP(double(inc(await doubleP(value)))),
    })
  }

  {
    assert({
      given: 'no starting value',
      should,
      actual: await asyncPipe(fixedNum, incP)(),
      expected: await incP(fixedNum()),
    })
  }

  {
    const errorMessage = 'foo'
    assert({
      given: 'a function that throws and .catch',
      should: 'be caught',
      actual: await asyncPipe(inc, throwError(errorMessage))(10).catch(identity),
      expected: errorMessage,
    })
  }
})

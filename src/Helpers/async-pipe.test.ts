import { identity, always } from 'ramda'
import { describe } from 'riteway'
import { asyncPipe } from './async-pipe'
import { toPromise } from './to-promise'

const double = (x: number) => x * 2
const inc = (x: number) => x + 1
const fixedNum = always(20)

const doubleP = toPromise(double)
const incP = toPromise(inc)

describe('asyncPipe', async (assert: any) => {
  const should = 'apply the value to the functions composition correctly'

  {
    const value = 10
    assert({
      given: 'sync and async functions',
      should,
      actual: await asyncPipe(doubleP, inc)(value).catch(identity),
      expected: inc(await doubleP(value)),
    })
  }

  {
    const value = 10
    assert({
      given: 'nested compositions of sync and async functions',
      should,
      actual: await asyncPipe(doubleP, inc, asyncPipe(double, incP))(value).catch(identity),
      expected: await incP(double(inc(await doubleP(value)))),
    })
  }

  {
    assert({
      given: 'no starting value',
      should,
      actual: await asyncPipe(fixedNum, incP)().catch(identity),
      expected: await incP(fixedNum()),
    })
  }
})

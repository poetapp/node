import { identity } from 'ramda'
import { describe, Try } from 'riteway'
import { asyncPipe } from './async-pipe'

const triple = (x: number) => x * 3
const double = (x: number) => x * 2
const inc = (x: number) => x + 1

describe('toPromise', async (assert: any) => {
  const given = 'given functions and a value'
  const should = 'apply the value to the functions composition correctly'

  {
    const value = 10
    assert({
      given,
      should,
      actual: await Try(asyncPipe(double, inc), value).catch(identity),
      expected: inc(double(value)),
    })
  }
  {
    const value = 10
    assert({
      given: 'nested compositions',
      should,
      actual: await Try(asyncPipe(triple, asyncPipe(double, inc)), value).catch(identity),
      expected: inc(double(triple(value))),
    })
  }
})

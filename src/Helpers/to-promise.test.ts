import { identity } from 'ramda'
import { describe, Try } from 'riteway'
import { toPromise } from './to-promise'

interface Foo {
  foo: number
}

const double = (x: number) => x * 2

const doubleFoo = (x: Foo): Foo => ({ foo: double(x.foo) })

describe('toPromise', async (assert: any) => {
  const given = 'given a function and a value'
  const should = 'apply the value to the function'

  {
    const value = 10
    assert({
      given,
      should,
      actual: await Try(toPromise(identity), value),
      expected: identity(value),
    })
  }

  {
    const value = 10
    assert({
      given,
      should,
      actual: await Try(toPromise(double), value),
      expected: double(value),
    })
  }

  {
    const value: Foo = { foo: 3 }
    assert({
      given,
      should,
      actual: await Try(toPromise(doubleFoo), value),
      expected: doubleFoo(value),
    })
  }

  {
    const value: Foo = { foo: 5 }
    assert({
      given: 'no function',
      should: 'apply the value to the default function of identity',
      actual: await Try(toPromise(), value),
      expected: identity(value),
    })
  }
})

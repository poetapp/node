/* tslint:disable:no-relative-imports */

import { describe } from 'riteway'

import './Promise'

describe('Promise', async (should: any) => {
  const { assert } = should('')

  const SUCCESS = true
  const ERROR = false

  const success = (_: any) => SUCCESS
  const error = (_: any) => ERROR

  {
    const actual = await Promise.reject(10)
      .ignoreError(error => error === 10)
      .then(success)
      .catch(error)

    assert({
      given: 'Promise.reject(10).ignoreError(10)',
      should: 'resolve',
      actual,
      expected: SUCCESS,
    })
  }

  {
    const actual = await Promise.reject(5)
      .ignoreError(error => error === 10)
      .then(success)
      .catch(error)

    assert({
      given: 'Promise.reject(5).ignoreError(10)',
      should: 'reject',
      actual,
      expected: ERROR,
    })
  }
})

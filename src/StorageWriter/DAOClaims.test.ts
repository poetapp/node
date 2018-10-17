/* tslint:disable:no-relative-imports */
import { FindAndModifyWriteOpResultObject } from 'mongodb'
import { describe, Try } from 'riteway'

import { TheRaven } from '../../tests/helpers/Claims'
import { getClaimFromFindAndUpdateResponse, throwIfClaimNotFound } from './DAOClaims'

describe('DOAClaims.getClaimFromFindAndUpdateResponse', async (assert: any) => {
  {
    const response: FindAndModifyWriteOpResultObject = {}
    assert({
      given: 'a response that does not contain a value',
      should: 'return the correct value',
      actual: getClaimFromFindAndUpdateResponse(response),
      expected: undefined,
    })
  }

  {
    const response: FindAndModifyWriteOpResultObject = { value: {} }
    assert({
      given: 'a response that does not contain a claim',
      should: 'return the correct value',
      actual: getClaimFromFindAndUpdateResponse(response),
      expected: undefined,
    })
  }

  {
    const response: FindAndModifyWriteOpResultObject = {
      value: {
        claim: TheRaven,
      },
    }
    assert({
      given: 'a response that contians a claim',
      should: 'return the correct value',
      actual: getClaimFromFindAndUpdateResponse(response),
      expected: TheRaven,
    })
  }
})

describe('DOAClaims.throwIfClaimNotFound', async (assert: any) => {
  assert({
    given: 'null',
    should: 'throw',
    actual: Try(throwIfClaimNotFound, null),
    expected: new Error(),
  })

  assert({
    given: 'undefined',
    should: 'throw',
    actual: Try(throwIfClaimNotFound, undefined),
    expected: new Error(),
  })

  {
    assert({
      given: 'a claim',
      should: 'return the claim',
      actual: throwIfClaimNotFound(TheRaven),
      expected: TheRaven,
    })
  }
})

import { Claim } from '@po.et/poet-js'
import { FindAndModifyWriteOpResultObject } from 'mongodb'
import { describe, Try } from 'riteway'

import { getClaimFromFindAndUpdateResponse, throwIfClaimNotFound } from './DAOClaims'

describe('DOAClaims.getClaimFromFindAndUpdateResponse', async should => {
  const { assert } = should('return the correct value')

  {
    const response: FindAndModifyWriteOpResultObject = {}
    assert({
      given: 'a response that does not contain a value',
      actual: getClaimFromFindAndUpdateResponse(response),
      expected: undefined,
    })
  }

  {
    const response: FindAndModifyWriteOpResultObject = { value: {} }
    assert({
      given: 'a response that does not contain a claim',
      actual: getClaimFromFindAndUpdateResponse(response),
      expected: undefined,
    })
  }

  {
    const claim = { id: 'bar' } as Claim
    const response: FindAndModifyWriteOpResultObject = {
      value: {
        claim,
      },
    }
    assert({
      given: 'a response that contians a claim',
      actual: getClaimFromFindAndUpdateResponse(response),
      expected: claim,
    })
  }
})

describe('DOAClaims.throwIfClaimNotFound', async should => {
  const { assert } = should()

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
    const claim: Claim = { id: 'bar' } as Claim
    assert({
      given: 'a claim',
      should: 'return the claim',
      actual: throwIfClaimNotFound(claim),
      expected: claim,
    })
  }
})

import { describe, Try } from 'riteway'

import { translateFundTransactionError, InsufficientFundsException } from './Exceptions'

describe('BlockchainWriter.translateFundTransactionError()', async assert => {
  {
    const error = new Error('Insufficient funds')

    assert({
      given: 'Insufficient Funds Error',
      should: 'return the correct error',
      actual: Try(translateFundTransactionError, error) instanceof InsufficientFundsException,
      expected: true,
    })
  }

  {
    const error = new Error()

    assert({
      given: 'a custom Error Message',
      should: 'return the correct error',
      actual: Try(translateFundTransactionError, error) instanceof InsufficientFundsException,
      expected: false,
    })
  }
})

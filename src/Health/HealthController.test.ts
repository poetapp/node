import { describe } from 'riteway'

import { isStatus200, addWalletIsBalanceLow, isFailureHard } from './HealthController'

describe('isStatus200()', async assert => {
  assert({
    given: 'object with status property equal to 200',
    should: 'return the correct boolean',
    actual: isStatus200({ status: 200 }),
    expected: true,
  })

  assert({
    given: 'object with status property not equal to 200',
    should: 'return the correct boolean',
    actual: isStatus200({ status: 2 }),
    expected: false,
  })
})

describe('addWalletIsBalanceLow()', async assert => {
  const walletGen = (balance = 0, txcount = 0) => ({
    balance,
    txcount,
  })
  const addWalletIsBalanceBelow2 = addWalletIsBalanceLow(2)
  const should = 'return walletInfo with correct isBalanceLow bool'
  {
    const walletInfo = walletGen(3)
    assert({
      given: 'a lowBalanceAmount lower than balance property of walletInfo',
      should,
      actual: addWalletIsBalanceBelow2(walletInfo),
      expected: { ...walletInfo, isBalanceLow: false },
    })
  }

  {
    const walletInfo = walletGen(2)
    assert({
      given: 'a lowBalanceAmount equal to balance property of walletInfo',
      should,
      actual: addWalletIsBalanceBelow2(walletInfo),
      expected: { ...walletInfo, isBalanceLow: false },
    })
  }

  {
    const walletInfo = walletGen(1)
    assert({
      given: 'a lowBalanceAmount higher than balance property of walletInfo',
      should,
      actual: addWalletIsBalanceBelow2(walletInfo),
      expected: { ...walletInfo, isBalanceLow: true },
    })
  }
})

describe('isFailureHard()', async assert => {

  assert({
    given: 'the string HARD',
    should: 'return true',
    actual: isFailureHard('HARD'),
    expected: true,
  })

  assert({
    given: 'a string other than HARD',
    should: 'return false',
    actual: isFailureHard('SOFT'),
    expected: false,
  })
})

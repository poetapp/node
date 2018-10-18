export class InsufficientFundsException extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export const translateFundTransactionError = (error: Error) => {
  throw error.message === 'Insufficient funds'
    ? new InsufficientFundsException('Insuffiecient funds for transaction')
    : error
}

/* tslint:disable:max-classes-per-file */
export class NoMoreEntriesException extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export class InsufficientFundsException extends Error {
  constructor(message?: string) {
    super(message)
  }
}

// tslint:disable:max-classes-per-file

export class NoMoreEntriesException extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export class IntegrityCheckFailure extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export const isNoMoreEntriesException = (err: any) => err instanceof NoMoreEntriesException

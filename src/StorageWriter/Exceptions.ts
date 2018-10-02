export class NoMoreEntriesException extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export const isNoMoreEntriesException = (err: any) => err instanceof NoMoreEntriesException

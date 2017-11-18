export class IllegalArgumentException extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class NotFoundException extends Error {
  constructor(message: string) {
    super(message)
  }
}
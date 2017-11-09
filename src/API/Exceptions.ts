export class Exception {
  readonly message: string

  constructor(message: string) {
    this.message = message
  }
}

export class IllegalArgumentException extends Exception {
  constructor(message: string) {
    super(message)
  }
}
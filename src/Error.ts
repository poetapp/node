if (!('toJSON' in Error.prototype))
  Object.defineProperty(Error.prototype, 'toJSON', {
    value() {
      return {
        ...this,
        stack: this.stack && this.stack.split('\n'),
        message: this.message,
        code: this.code,
        type: this.type || this.constructor.name,
      }
    },
    configurable: true,
    writable: true,
  })

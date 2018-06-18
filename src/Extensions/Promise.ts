interface Promise<T> {
  rethrow(translateError: (x: any) => any): this
}

Promise.prototype.rethrow =
  Promise.prototype.rethrow ||
  function(translateError) {
    return this.catch((error: any) => {
      throw translateError(error)
    })
  }

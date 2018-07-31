interface Promise<T> {
  rethrow(translateError: (x: any) => any): this
  ignoreError(ignore: (x: any) => boolean): this
}

Promise.prototype.rethrow =
  Promise.prototype.rethrow ||
  function(translateError) {
    return this.catch((error: any) => {
      throw translateError(error)
    })
  }

Promise.prototype.ignoreError =
  Promise.prototype.ignoreError ||
  function(ignore) {
    return this.catch((error: any) => {
      if (!ignore(error)) throw error
    })
  }

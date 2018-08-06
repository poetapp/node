/* tslint:disable:readonly-keyword no-object-mutation */
interface Array<T> {
  toObject: () => object
}
interface ReadonlyArray<T> {
  toObject: () => object
}

Array.prototype.toObject = function(): object {
  return this.reduce((acum: any, curr: any) => {
    acum[curr[0]] = curr[1]
    return acum
  }, {})
}

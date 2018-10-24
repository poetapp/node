import { identity } from 'ramda'
export const toPromise = <A, B>(fn: (a: A) => B = identity) => (v: A) => Promise.resolve(fn(v))

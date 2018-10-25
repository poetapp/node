import { identity } from 'ramda'

type toPromise = <A, B>(fn?: (a: A) => B) => (v: A) => Promise<B>

export const toPromise: toPromise = (fn = identity) => v => Promise.resolve(fn(v))

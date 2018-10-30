export function asyncPipe<V0 extends any, T1>(fn1: (x?: V0) => T1 | Promise<T1>): (x?: V0) => Promise<T1>

export function asyncPipe<V0 extends any, T1, T2>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
): (x?: V0) => Promise<T2>

export function asyncPipe<V0 extends any, T1, T2, T3>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
): (x?: V0) => Promise<T3>

export function asyncPipe<V0 extends any, T1, T2, T3, T4>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
): (x?: V0) => Promise<T4>

export function asyncPipe<V0 extends any, T1, T2, T3, T4, T5>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
  fn5: (x?: T4) => T5 | Promise<T5>,
): (x?: V0) => Promise<T5>

export function asyncPipe<V0 extends any, T1, T2, T3, T4, T5, T6>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
  fn5: (x?: T4) => T5 | Promise<T5>,
  fn6: (x?: T5) => T6 | Promise<T6>,
): (x?: V0) => Promise<T6>

export function asyncPipe<V0 extends any, T1, T2, T3, T4, T5, T6, T7>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
  fn5: (x?: T4) => T5 | Promise<T5>,
  fn6: (x?: T5) => T6 | Promise<T6>,
  fn7: (x?: T6) => T7 | Promise<T7>,
): (x?: V0) => Promise<T7>

export function asyncPipe<V0 extends any, T1, T2, T3, T4, T5, T6, T7, T8>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
  fn5: (x?: T4) => T5 | Promise<T5>,
  fn6: (x?: T5) => T6 | Promise<T6>,
  fn7: (x?: T6) => T7 | Promise<T7>,
  fn8: (x?: T7) => T8 | Promise<T8>,
): (x?: V0) => Promise<T8>

export function asyncPipe<V0 extends any, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
  fn5: (x?: T4) => T5 | Promise<T5>,
  fn6: (x?: T5) => T6 | Promise<T6>,
  fn7: (x?: T6) => T7 | Promise<T7>,
  fn8: (x?: T7) => T8 | Promise<T8>,
  fn9: (x?: T8) => T9 | Promise<T9>,
): (x?: V0) => Promise<T9>

export function asyncPipe<V0 extends any, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  fn1: (x?: V0) => T1 | Promise<T1>,
  fn2: (x?: T1) => T2 | Promise<T2>,
  fn3: (x?: T2) => T3 | Promise<T3>,
  fn4: (x?: T3) => T4 | Promise<T4>,
  fn5: (x?: T4) => T5 | Promise<T5>,
  fn6: (x?: T5) => T6 | Promise<T6>,
  fn7: (x?: T6) => T7 | Promise<T7>,
  fn8: (x?: T7) => T8 | Promise<T8>,
  fn9: (x?: T8) => T9 | Promise<T9>,
  fn10: (x?: V0) => T10 | Promise<T10>,
): (x?: V0) => Promise<T10>

export function asyncPipe(...fns: any[]) {
  return (v?: any) => fns.reduce(async (a, c) => c(await a), Promise.resolve(v))
}

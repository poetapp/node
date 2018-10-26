interface asyncPipe {
  asyncPipe <V extends any, T1>(
    fn0: (x: V) => T1,
  ) :  (x: V) => T1;
  asyncPipe <V extends any, T1, T2>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
  ) :  (x: V) => T2;
  asyncPipe <V extends any, T1, T2, T3>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
  ) :  (x: V) => T3;
  asyncPipe <V extends any, T1, T2, T3, T4>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
  ) :  (x: V) => T4;
  asyncPipe <V extends any, T1, T2, T3, T4, T5>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
    fn5: (x: V) => T5,
  ) :  (x: V) => T5;
  asyncPipe <V extends any, T1, T2, T3, T4, T5, T6>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
    fn5: (x: V) => T5,
    fn6: (x: V) => T6,
  ) :  (x: V) => T6;
  asyncPipe <V extends any, T1, T2, T3, T4, T5, T6, T7>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
    fn5: (x: V) => T5,
    fn6: (x: V) => T6,
    fn7: (x: V) => T7,
  ) :  (x: V) => T7;
  asyncPipe <V extends any, T1, T2, T3, T4, T5, T6, T7, T8>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
    fn5: (x: V) => T5,
    fn6: (x: V) => T6,
    fn7: (x: V) => T7,
    fn8: (x: V) => T8,
  ) :  (x: V) => T8;
  asyncPipe <V extends any, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
    fn5: (x: V) => T5,
    fn6: (x: V) => T6,
    fn7: (x: V) => T7,
    fn8: (x: V) => T8,
    fn9: (x: V) => T9,
  ) :  (x: V) => T9;
  asnycPipe <V extends any, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    fn0: (x: V) => T1,
    fn1: (x: V) => T2,
    fn3: (x: V) => T3,
    fn4: (x: V) => T4,
    fn5: (x: V) => T5,
    fn6: (x: V) => T6,
    fn7: (x: V) => T7,
    fn8: (x: V) => T8,
    fn9: (x: V) => T9,
    fn10: (x: V) => T10,
  ) :  (x: V) => T10;
}

export const asyncPipe: asyncPipe = (...fns: any[]) => (v: any) => fns.reduce(async (a, c) => c(await a), v)

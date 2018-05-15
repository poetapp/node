type PromiseLift = (x: any) => Promise<any>

export const asyncPipe = (...fns: PromiseLift[]) => (x: any) => fns.reduce(async (acc, cur) => cur(await acc), x)

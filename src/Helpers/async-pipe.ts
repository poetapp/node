type Func = (v?: any) => any | Promise<any>

type asyncPipe = (...fns: Func[]) => (v?: any) => Promise<any>
export const asyncPipe: asyncPipe = (...fns) => v => fns.reduce(async (a, c) => c(await a), v)

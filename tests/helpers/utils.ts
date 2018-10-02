import { promisify } from 'util'

export const runtimeId = () => `${process.pid}-${new Date().getMilliseconds()}-${Math.floor(Math.random() * 10)}`
export const delay = promisify(setTimeout)

import { promisify } from 'util'

import { dbHelper } from './database'

export const runtimeId = () => `${process.pid}-${new Date().getMilliseconds()}-${Math.floor(Math.random() * 10)}`
export const delay = promisify(setTimeout)

export const createDatabase = async (prefix: string) => {
  const db = dbHelper()

  return {
    teardown: db.teardown,
    settings: await db.setup(prefix),
  }
}

/* tslint:disable:no-relative-imports */
import { promisify } from 'util'
import { secondsToMiliseconds } from '../../src/Helpers/Time'
import { asyncPipe } from '../../src/Helpers/asyncPipe'
import { app } from '../../src/app'
import { dbHelper } from './database'
import { RabbitMQ } from './rabbitMQ'

export const runtimeId = () => `${process.pid}-${new Date().getMilliseconds()}-${Math.floor(Math.random() * 10)}`
export const delay = promisify(setTimeout)

export const delayInSeconds = asyncPipe(secondsToMiliseconds, delay)

export const createDatabase = async (prefix: string) => {
  const db = dbHelper()

  return {
    teardown: db.teardown,
    settings: await db.setup(prefix),
    collection: db.collection,
  }
}

const defaultBlockchainSettings = {
  MINIMUM_BLOCK_HEIGHT: 100,
  ANCHOR_INTERVAL_IN_SECONDS: 10,
  BATCH_CREATION_INTERVAL_IN_SECONDS: 5,
  READ_DIRECTORY_INTERVAL_IN_SECONDS: 5,
  UPLOAD_CLAIM_INTERVAL_IN_SECONDS: 5,
}

export const setUpDb = async (prefix: string) => {
  return createDatabase(prefix)
}

export const setUpServerAndDb = async ({
  PREFIX,
  NODE_PORT,
  blockchainSettings = defaultBlockchainSettings,
}: {
  PREFIX: string
  NODE_PORT: string
  blockchainSettings?: any,
}) => {
  const db = await createDatabase(PREFIX)
  const server = await app({
    BITCOIN_URL: process.env.BITCOIN_URL || 'bitcoind-1',
    API_PORT: NODE_PORT,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    EXCHANGE_PREFIX: PREFIX,
    ...blockchainSettings,
  })
  await delay(5 * 1000)
  const rabbitMQ = await RabbitMQ(process.env.RABBITMQ_URL)

  return { db, server, rabbitMQ }
}

export const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`

export const timeoutPromise = (seconds = 10): Promise<any> => {
  return new Promise((resolve, reject) => setTimeout(reject, 1000 * seconds, 'Timeout'))
}

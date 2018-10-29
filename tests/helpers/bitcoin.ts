/* tslint:disable:no-relative-imports */
const Client = require('bitcoin-core')
import { delay } from '../helpers/utils'

const BITCOIND_A = 'bitcoind-1'
const BITCOIND_B = 'bitcoind-2'

const createClient = (host: string) =>
  new Client({
    host,
    port: 18443,
    network: 'regtest',
    password: 'bitcoinrpcpassword',
    username: 'bitcoinrpcuser',
  })

const clientSingleton = (hostA: string = BITCOIND_A, hostB: string = BITCOIND_B) => {
  const btcdClientA: any = null
  const btcdClientB: any = null

  return () => ({
    btcdClientA: btcdClientA || createClient(hostA),
    btcdClientB: btcdClientB || createClient(hostB),
  })
}

export const bitcoindClients = clientSingleton(process.env.BITCOIN_URL, process.env.BITCOIN_URL_B)

export const resetBitcoinServers = async () => {
  const { btcdClientA, btcdClientB }: any = bitcoindClients()

  await btcdClientA.stop()
  await btcdClientB.stop()
  await delay(5 * 1000)
}

export const ensureBitcoinBalance = async (client: any, blocks: number = 101) => {
  const balance = await client.getBalance()
  if (balance === 0) await client.generate(blocks)
}

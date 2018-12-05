/* tslint:disable:no-relative-imports */
const Client = require('bitcoin-core')
import {delay, delayInSeconds} from '../helpers/utils'

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
  const bitcoinCoreClientA: any = null
  const bitcoinCoreClientB: any = null

  return () => ({
    bitcoinCoreClientA: bitcoinCoreClientA || createClient(hostA),
    bitcoinCoreClientB: bitcoinCoreClientB || createClient(hostB),
  })
}

export const waitForBlockchainSync = async (targetBlockHeight: number, bitcoinClient: any): Promise<void> => {
  let { blocks } = await bitcoinClient.getBlockchainInfo()
  while (blocks < targetBlockHeight) {
    await delayInSeconds(10)
    blocks = (await bitcoinClient.getBlockchainInfo()).blocks
  }
}

export const bitcoindClients = clientSingleton(process.env.BITCOIN_URL, process.env.BITCOIN_URL_B)

export const resetBitcoinServers = async () => {
  const { bitcoinCoreClientA, bitcoinCoreClientB }: any = bitcoindClients()

  await bitcoinCoreClientA.stop()
  await bitcoinCoreClientB.stop()
  await delay(5 * 1000)
}

export const ensureBitcoinBalance = async (client: any, blocks: number = 101) => {
  const balance = await client.getBalance()
  if (balance === 0) await client.generate(blocks)
}

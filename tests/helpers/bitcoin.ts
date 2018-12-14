/* tslint:disable:no-relative-imports */
import BitcoinCore = require('bitcoin-core')
const Client = require('bitcoin-core')
import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { loadConfigurationWithDefaults } from 'LoadConfiguration'
import * as Pino from 'pino'
import {delay, delayInSeconds} from '../helpers/utils'

const BITCOIND_A = 'bitcoind-1'
const BITCOIND_B = 'bitcoind-2'

const loggingConfiguration: LoggingConfiguration = loadConfigurationWithDefaults()
const logger: Pino.Logger = createModuleLogger(loggingConfiguration, __dirname)

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
export const waitForBlockchainsToSync = async (
  targetBlockHeight: number,
  bitcoinClients: ReadonlyArray<BitcoinCore>,
): Promise<void> => {
  const waitForTargetHeight = waitForBlockchainSync(targetBlockHeight)
  await Promise.all(bitcoinClients.map(waitForTargetHeight))
}

export const waitForBlockchainSync = (targetBlockHeight: number) =>
  async (bitcoinClient: BitcoinCore): Promise<void> => {
    logger.info(`Waiting for ${targetBlockHeight}`)
    let { blocks } = await bitcoinClient.getBlockchainInfo()
    while (blocks < targetBlockHeight) {
      await delayInSeconds(10)
      blocks = (await bitcoinClient.getBlockchainInfo()).blocks
      logger.info(`currentHeight: ${blocks}`)
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

export const generateReorgs = async (btcdClientA: any, btcdClientB: any) => {
  await btcdClientB.setNetworkActive(false)
  await btcdClientB.generate(2)
  await btcdClientA.generate(1)
  await btcdClientB.setNetworkActive(true)
}

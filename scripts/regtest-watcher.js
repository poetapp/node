#!/usr/bin/env node

const logger = require('pino')()
const Client = require('bitcoin-core')

const {
  BITCOIN_URL: host = 'bitcoind-1',
  BITCOIN_PORT: port = '18443',
  BITCOIN_USERNAME: username = "bitcoinrpcuser",
  BITCOIN_PASSWORD: password = "bitcoinrpcpassword",
  BITCOIN_NEW_BLOCK_INTERVAL_MS: newBlockInterval = 60000,
} = process.env

const configuration = { host, port, network: 'regtest', username, password }
const bitcoindClientA = new Client(configuration)

const main = async () => {
  try {
    logger.info('Checking wallet balance')
    const balance = await bitcoindClientA.getBalance()
    logger.info({ balance }, `Wallet balance retrieved`)

    if (balance === 0) {
      logger.info('Wallet is empty - generating bitcoin')
      await bitcoindClientA.generate(101)
    }

    logger.info('Mining 1 block.')
    await bitcoindClientA.generate(1)
  } catch (e) {
    logger.error('Error: ' + e.message)
    logger.info('Regtest Watcher exited')
    process.exit(1)
  }
}

logger.info({ ...configuration, password: '[HIDDEN]' }, 'Regtest Watcher started')
main().then(
  setInterval(
    () => main().then(() => logger.info({ newBlockInterval }, 'Regtest Watcher interval finished')),
    parseInt(newBlockInterval)
  )
)

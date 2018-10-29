/* tslint:disable:no-relative-imports */
import { bitcoindClients, resetBitcoinServers } from '../tests/helpers/bitcoin'

const { btcdClientA }: any = bitcoindClients()

const main = async () => {
  console.log('Stopping bitcoind container...')
  await resetBitcoinServers()

  let count = await btcdClientA.getBlockCount()
  console.log(`initial blocksize: ${count}`)

  await btcdClientA.generate(101)

  count = await btcdClientA.getBlockCount()
  console.log(`after generating 101 blocks: ${count}`)

  console.log('Stopping bitcoind container...')
  await resetBitcoinServers()

  count = await btcdClientA.getBlockCount()
  console.log(`block count after stop: ${count}`)

  await btcdClientA.generate(11)

  count = await btcdClientA.getBlockCount()
  console.log(`block count after generating 11 blocks: ${count}`)
}

main().then()

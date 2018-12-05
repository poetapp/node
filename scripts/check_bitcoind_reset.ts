/* tslint:disable:no-relative-imports */

/*
 * This is a utility script to verify that bitcoind reset is working on
 * a local development machine.
 *
 * Make sure all services are up and running and then:
 * $ docker-compose exec poet-node npx ts-node -r tsconfig-paths/register -r reflect-metadata --files * scripts/check_bitcoind_reset.ts
 */

import { bitcoindClients, resetBitcoinServers } from '../tests/helpers/bitcoin'

const { bitcoinCoreClientA }: any = bitcoindClients()

const main = async () => {
  console.log('Stopping bitcoind container...')
  await resetBitcoinServers()

  let count = await bitcoinCoreClientA.getBlockCount()
  console.log(`initial blocksize: ${count}`)

  await bitcoinCoreClientA.generate(101)

  count = await bitcoinCoreClientA.getBlockCount()
  console.log(`after generating 101 blocks: ${count}`)

  console.log('Stopping bitcoind container...')
  await resetBitcoinServers()

  count = await bitcoinCoreClientA.getBlockCount()
  console.log(`block count after stop: ${count}`)

  await bitcoinCoreClientA.generate(11)

  count = await bitcoinCoreClientA.getBlockCount()
  console.log(`block count after generating 11 blocks: ${count}`)
}

main().then()

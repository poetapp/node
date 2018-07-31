import { InsightClient } from '@po.et/poet-js'
import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { Service } from './Service'

describe('BlockchainWriter Service', async (should: any) => {
  const { assert } = should('')

  const urlInsight = 'https://insight'
  const configuration: ClaimControllerConfiguration = {
    bitcoinAddress: 'bitcoinAddress',
    bitcoinAddressPrivateKey: 'bitcoinAddressPrivateKey',
    poetNetwork: 'poet',
    poetVersion: [1],
  }

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const claimController = new ClaimController(
    Pino(),
    new Db('poet', server),
    new Messaging(),
    new InsightClient(urlInsight),
    configuration
  )

  const serviceConfiguration = {
    timestampIntervalInSeconds: 1,
  }

  {
    const service = new Service(Pino(), claimController, serviceConfiguration)

    assert({
      given: 'the new instance of Service',
      should: 'be an instance of Service',
      actual: service instanceof Service,
      expected: true,
    })
  }
})

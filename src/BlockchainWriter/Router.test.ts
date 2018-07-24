import { describe } from 'riteway'
import * as Pino from 'pino'
import { Db, Server } from 'mongodb'
import { InsightClient } from '@po.et/poet-js'

import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { Messaging } from '../Messaging/Messaging'
import { Router } from './Router'

describe('BlockchainWriter Router', async (should: any) => {
  const { assert } = should('')

  const urlInsight = 'https://insight'
  const configuration: ClaimControllerConfiguration = {
    bitcoinAddress: 'bitcoinAddress',
    bitcoinAddressPrivateKey: 'bitcoinAddressPrivateKey',
    poetNetwork: 'poet',
    poetVersion: [1]
  }

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const claimController = new ClaimController(
    Pino(), new Db('poet', server),
    new Messaging(),
    new InsightClient(urlInsight),
    configuration
  )
  
  {
    const router = new Router(Pino(), new Messaging(), claimController)
    
    assert({
      given: 'the new instance of Router',
      should: 'be an instance of Router',
      actual: router instanceof Router,
      expected: true,
    })
  }
})
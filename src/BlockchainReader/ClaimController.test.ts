import { InsightClient } from '@po.et/poet-js'
import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

describe('BlockchainReader ClaimController', async (should: any) => {
  const { assert } = should('')

  const urlInsight = 'https://insight'
  const configuration: ClaimControllerConfiguration = {
    poetNetwork: 'poetNetwork',
    poetVersion: [1],
  }

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)

  {
    const claimController = new ClaimController(
      Pino(),
      new Db('poet', server),
      new Messaging(),
      new InsightClient(urlInsight),
      configuration
    )

    assert({
      given: 'the new instance of ClaimController',
      should: 'be an instance of ClaimController',
      actual: claimController instanceof ClaimController,
      expected: true,
    })
  }
})

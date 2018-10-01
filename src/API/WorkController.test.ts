import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { WorkController } from './WorkController'

describe('API WorkController', async (should: any) => {
  const { assert } = should('')

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const exchangeConfiguration: ExchangeConfiguration = {
    newClaim: '',
  }

  const exchangeConfigurationMessaging: ExchangeConfiguration = {
    poetAnchorDownloaded: '',
    claimsDownloaded: '',
    newClaim: '',
  }

  {
    const workController = new WorkController(
      Pino(),
      new Db('poet', server),
      new Messaging('', exchangeConfigurationMessaging),
      exchangeConfiguration
    )

    assert({
      given: 'the new instance of WorkController',
      should: 'be an instance of WorkController',
      actual: workController instanceof WorkController,
      expected: true,
    })
  }
})

import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { HealthController } from './HealthController'
import { HealthControllerConfiguration } from './HealthControllerConfiguration'
import { Router } from './Router'
import { RouterConfiguration } from './RouterConfiguration'
import { WorkController } from './WorkController'

describe('API Router', async (assert: any) => {
  const configuration = { port: 3000 } as RouterConfiguration
  const healthControllerConfiguration: HealthControllerConfiguration = {
    downloadMaxAttempts: 1,
  }
  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const healthController = new HealthController(new Db('poet', server), healthControllerConfiguration)
  const exchangeConfiguration: ExchangeConfiguration = {
    poetAnchorDownloaded: '',
    claimsDownloaded: '',
  }
  const exchangeConfigurationMessaging: ExchangeConfiguration = {
    poetAnchorDownloaded: '',
    claimsDownloaded: '',
    newClaim: '',
  }
  const workController = new WorkController(
    Pino(),
    new Db('poet', server),
    new Messaging('', exchangeConfigurationMessaging),
    exchangeConfiguration
  )

  {
    const router = new Router(Pino(), configuration, workController, healthController)

    assert({
      given: 'the new instance of Router',
      should: 'be an instance of Router',
      actual: router instanceof Router,
      expected: true,
    })
  }
})

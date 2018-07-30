import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { Router } from './Router'
import { RouterConfiguration } from './RouterConfiguration'
import { WorkController } from './WorkController'

describe('API Router', async (should: any) => {
  const { assert } = should('')

  const configuration = { port: 3000 } as RouterConfiguration
  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const workController = new WorkController(Pino(), new Db('poet', server), new Messaging())

  {
    const router = new Router(Pino(), configuration, workController)

    assert({
      given: 'the new instance of Router',
      should: 'be an instance of Router',
      actual: router instanceof Router,
      expected: true,
    })
  }

  {
    const router = new Router(Pino(), configuration, workController)
    const result = await router
      .start()
      .then(_ => true)
      .catch(_ => _)

    assert({
      given: 'calling .start() on a new instance of Router',
      should: 'not though any errors',
      actual: result,
      expected: true,
    })

    await router.stop()
  }
})

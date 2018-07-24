import { describe } from 'riteway'
import * as Pino from 'pino'
import { Db, Server } from 'mongodb'

import { Messaging } from '../Messaging/Messaging'
import { WorkController } from './WorkController'
import { Router } from './Router'

describe('View Router', async (should: any) => {
  const { assert } = should('')
  
  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const workController = new WorkController(Pino(), new Db('poet', server))

  {
    const router = new Router(Pino(), new Messaging(), workController)

    assert({
      given: 'the new instance of Router',
      should: 'be an instance of Router',
      actual: router instanceof Router,
      expected: true,
    })
  }
})

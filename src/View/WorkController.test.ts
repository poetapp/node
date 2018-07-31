import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { WorkController } from './WorkController'

describe('View WorkController', async (should: any) => {
  const { assert } = should('')

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)

  {
    const workController = new WorkController(Pino(), new Db('poet', server))

    assert({
      given: 'the new instance of WorkController',
      should: 'be an instance of WorkController',
      actual: workController instanceof WorkController,
      expected: true,
    })
  }
})

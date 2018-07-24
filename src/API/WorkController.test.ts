import { describe } from 'riteway'
import * as Pino from 'pino'
import { Db, Server } from 'mongodb'
import { RouterConfiguration } from './RouterConfiguration'
import { Messaging } from '../Messaging/Messaging'
import { WorkController } from './WorkController'


describe('API WorkController', async (should: any) => {
  const { assert } = should('')

  const configuration = { port: 3000 } as RouterConfiguration
  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  
  {
    const workController = new WorkController(Pino(), new Db('poet', server), new Messaging())

    assert({
      given: 'the new instance of WorkController',
      should: 'be an instance of WorkController',
      actual: workController instanceof WorkController,
      expected: true,
    })
  }
})

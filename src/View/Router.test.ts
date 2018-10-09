import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { WorkController } from './WorkController'

describe('View Router', async (assert: any) => {
  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const workController = new WorkController(Pino(), new Db('poet', server))
  const exchangeConfiguration: ExchangeConfiguration = {
    newClaim: '',
    claimIpfsHash: '',
    ipfsHashTxId: '',
    batchReaderReadNextDirectorySuccess: '',
    batchWriterCreateNextBatchSuccess: '',
  }

  const exchangeConfigurationMessaging: ExchangeConfiguration = {
    poetAnchorDownloaded: '',
    claimsDownloaded: '',
  }

  {
    const router = new Router(
      Pino(),
      new Messaging('', exchangeConfigurationMessaging),
      workController,
      exchangeConfiguration
    )

    assert({
      given: 'the new instance of Router',
      should: 'be an instance of Router',
      actual: router instanceof Router,
      expected: true,
    })
  }
})

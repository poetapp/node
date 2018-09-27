import { Messaging } from 'Messaging/Messaging'
import { Db, Server } from 'mongodb'
import * as Pino from 'pino'
import { describe } from 'riteway'

import { ClaimController } from './ClaimController'
import { ExchangeConfiguration } from './ExchangeConfiguration'
import { IPFS } from './IPFS'
import { IPFSConfiguration } from './IPFSConfiguration'
import { Router } from './Router'

describe('Storage Router', async (should: any) => {
  const { assert } = should('')

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const IPFSConfiguration: IPFSConfiguration = {
    ipfsUrl: '',
  }

  const exchangeConfiguration: ExchangeConfiguration = {
    claimIpfsHash: '',
    newClaim: '',
  }

  const exchangeConfigurationMessaging: ExchangeConfiguration = {
    poetAnchorDownloaded: '',
    claimsDownloaded: '',
  }

  const claimController = new ClaimController(
    Pino(),
    new Db('poet', server),
    new Messaging('', exchangeConfigurationMessaging),
    new IPFS(IPFSConfiguration),
    exchangeConfiguration
  )

  {
    const router = new Router(
      Pino(),
      new Messaging('', exchangeConfigurationMessaging),
      claimController,
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

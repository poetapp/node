import { describe } from 'riteway'
import * as Pino from 'pino'
import { Db, Server } from 'mongodb'
import { InsightClient } from '@po.et/poet-js'

import { BlockchainReaderService } from './BlockchainReaderService'
import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { BlockchainReaderServiceConfiguration } from './BlockchainReaderServiceConfiguration'
import { Messaging } from '../Messaging/Messaging'

describe('BlockchainReaderService', async (should: any) => {
  const { assert } = should('')

  const urlInsight = 'https://insight'
  const configuration: ClaimControllerConfiguration = {
      poetNetwork: 'poetNetwork',
      poetVersion: [1]
  }

  const blockchainReaderServiceConfiguration: BlockchainReaderServiceConfiguration = {
      minimumBlockHeight: 1,
      blockchainReaderIntervalInSeconds: 1,
      forceBlockHeight: 1
  }

  const host = 'http://localhost'
  const port = 3000
  const server = new Server(host, port)
  const claimController = new ClaimController(
    Pino(), 
    new Db('poet', server), 
    new Messaging(), 
    new InsightClient(urlInsight), 
    configuration
  )

  {
    const blockchainReaderService = new BlockchainReaderService(
      Pino(), 
      claimController, 
      blockchainReaderServiceConfiguration
    )

    assert({
      given: 'the new instance of BlockchainReaderService',
      should: 'be an instance of BlockchainReaderService',
      actual: blockchainReaderService instanceof BlockchainReaderService,
      expected: true,
    })
  }
})
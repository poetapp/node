import { getVerifiableClaimSigner } from '@po.et/poet-js'
import { Collection, MongoClient, Db } from 'mongodb'
import * as Pino from 'pino'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { FileController, FileControllerConfiguration } from './FileController'
import * as FileDAO from './FileDAO'
import { HealthController } from './HealthController'
import * as IPFSDirectoryHashDAO from './IPFSDirectoryHashDAO'
import { Router } from './Router'
import { WorkController } from './WorkController'

export interface APIConfiguration extends LoggingConfiguration, FileControllerConfiguration {
  readonly port: number
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class API {
  private readonly logger: Pino.Logger
  private readonly configuration: APIConfiguration
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging
  private fileCollection: Collection
  private ipfsDirectoryHashCollection: Collection

  constructor(configuration: APIConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'API Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    this.fileCollection = this.dbConnection.collection('files')
    this.ipfsDirectoryHashCollection = this.dbConnection.collection('ipfsDirectoryHashInfo')

    this.messaging = new Messaging(this.configuration.rabbitmqUrl, this.configuration.exchanges)
    await this.messaging.start()

    const fileDao = new FileDAO.FileDAO({
      dependencies: {
        collection: this.fileCollection,
      },
    })

    const ipfsDirectoryHashDAO = new IPFSDirectoryHashDAO.IPFSDirectoryHashDAO({
      dependencies: {
        collection: this.ipfsDirectoryHashCollection,
      },
    })

    const fileController = new FileController({
      dependencies: {
        fileDao,
        logger: this.logger,
      },
      configuration: {
        ipfsArchiveUrlPrefix: this.configuration.ipfsArchiveUrlPrefix,
        ipfsUrl: this.configuration.ipfsUrl,
      },
    })

    const workController = new WorkController({
      dependencies: {
        logger: this.logger,
        db: this.dbConnection,
        messaging: this.messaging,
      },
      exchange: this.configuration.exchanges,
    })

    const healthController = new HealthController({
      dependencies: {
        db: this.dbConnection,
      },
    })

    this.router = new Router({
      dependencies: {
        logger: this.logger,
        fileController,
        workController,
        healthController,
        verifiableClaimSigner: getVerifiableClaimSigner(),
      },
      configuration: {
        port: this.configuration.port,
      },
    })
    await this.router.start()

    this.logger.info('API Started')
  }

  async stop() {
    this.logger.info('Stopping API...')
    this.logger.info('Stopping API Database...')
    await this.mongoClient.close()
    await this.router.stop()
    this.logger.info('Stopping API Messaging...')
    await this.messaging.stop()
  }
}

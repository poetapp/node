import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'
import { pick } from 'ramda'

import { LoggingConfiguration } from 'Configuration'
import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { Router } from './Router'
import { WorkController } from './WorkController'

export interface ViewConfiguration extends LoggingConfiguration {
  readonly dbUrl: string
  readonly rabbitmqUrl: string
  readonly exchanges: ExchangeConfiguration
}

export class View {
  private readonly logger: Pino.Logger
  private readonly configuration: ViewConfiguration
  private mongoClient: MongoClient
  private dbConnection: Db
  private router: Router
  private messaging: Messaging

  constructor(configuration: ViewConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'View Starting')
    this.mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    this.dbConnection = await this.mongoClient.db()

    const exchangesMessaging = pick(['poetAnchorDownloaded', 'claimsDownloaded'], this.configuration.exchanges)
    this.messaging = new Messaging(this.configuration.rabbitmqUrl, exchangesMessaging)
    await this.messaging.start()

    const workController = new WorkController({
      dependencies: {
        logger: this.logger,
        db: this.dbConnection,
      },
    })

    this.router = new Router({
      dependencies: {
        logger: this.logger,
        messaging: this.messaging,
        workController,
      },
      exchange: this.configuration.exchanges,
    })
    await this.router.start()

    this.logger.info('View Started')
  }

  async stop() {
    this.logger.info('Stopping View...')
    await this.router.stop()
    this.logger.info('Stopping View Database...')
    await this.mongoClient.close()
  }
}

#!/usr/bin/env node

import { app } from 'app'
import * as Pino from 'pino'

const logger: Pino.Logger = Pino()

process.on('unhandledRejection', (e) => {
  logger.fatal('unhandledRejection', e)
  process.exit()
})

process.on('uncaughtException', (e) => {
  logger.fatal('uncaughtException', e)
  process.exit()
})

app()
  .then(server => process.on('SIGINT', () => server.stop()))
  .catch(exception => logger.fatal({ exception }, 'server was unable to start'))

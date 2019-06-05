#!/usr/bin/env node

import { app } from 'app'
import * as Pino from 'pino'

const logger: Pino.Logger = Pino()

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e)
  process.exit()
})

process.on('uncaughtException', (e) => {
  console.log('uncaughtException', e)
  process.exit()
})

app()
  .then(server => process.on('SIGINT', () => server.stop()))
  .catch(exception => logger.error({ exception }, 'server was unable to start'))

#!/usr/bin/env node

import { app } from 'app'
import * as Pino from 'pino'

const logger: Pino.Logger = Pino()

app()
  .then(server => process.on('SIGINT', () => server.stop()))
  .catch(exception => logger.error({ exception }, 'server was unable to start'))

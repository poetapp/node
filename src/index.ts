#!/usr/bin/env node

/* tslint:disable:no-console */
/* tslint:disable:no-relative-imports */
import { app } from './app'

app()
  .then(server => process.on('SIGINT', () => server.stop()))
  .catch(console.error)

#!/usr/bin/env node

/* tslint:disable:no-console */
import { app } from 'app'

app()
  .then(server => process.on('SIGINT', () => server.stop()))
  .catch(console.error)

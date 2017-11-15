import 'reflect-metadata'

import { API } from 'API/API'
import { Configuration } from 'Configuration'

async function main() {
  console.log('Running Po.et Node')
  console.log('')

  console.log('Starting API...')
  const api = new API({port: Configuration.apiPort, dbUrl: Configuration.mongodbUrl})
  await api.start()
}

main().catch(console.error)

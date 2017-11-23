import 'reflect-metadata'

import { API } from 'API/API'
import { Configuration } from 'Configuration'
import { Storage } from './Storage/Storage'
import { View } from './View/View'

async function main() {
  console.log('Running Po.et Node')
  console.log('')

  const api = new API({port: Configuration.apiPort, dbUrl: Configuration.mongodbUrl})
  try {
    await api.start()
  } catch (ex) {
    console.log('API was unable to start. Cause was: \n', ex)
  }

  const view = new View({dbUrl: Configuration.mongodbUrl})
  try {
    await view.start()
  } catch (ex) {
    console.log('View was unable to start. Cause was: \n', ex)
  }

  const storage = new Storage({dbUrl: Configuration.mongodbUrl, ipfsUrl: Configuration.ipfsUrl})
  try {
    await storage.start()
  } catch (ex) {
    console.log('Storage was unable to start. Cause was: \n', ex)
  }
}

main().catch(console.error)

import { API } from './API/API'
import { Configuration } from './Configuration'

async function main() {
  console.log('Running Po.et Node')
  console.log('')

  console.log('Starting API...')
  const api = new API({port: Configuration.apiPort})
  api.start()
  console.log('API Listening at port 8080')
}

main().catch(console.error)
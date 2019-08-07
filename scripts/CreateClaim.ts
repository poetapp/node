/* tslint:disable:no-console */
import { Client } from '../tests/helpers/Helper'
import { createACDClaim } from '../tests/helpers/createClaims'

const main = async () => {
  const attributes = {
    name: process.argv[2] || 'testing claim',
    author: process.argv[3] || 'the tester',
    about: [ process.argv[4] ],
  }
  const client = new Client()
  const claim = await createACDClaim(attributes)

  console.log(JSON.stringify(claim, null, 2))

  const response = await client.postWork(claim)
}

main().catch(console.error)

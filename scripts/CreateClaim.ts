/* tslint:disable:no-console */
import { createClaim, ClaimType } from '@po.et/poet-js'

import { PrivateKeyACD } from '../test/Claims'
import { Client } from '../test/Integration/Helper'

const main = async () => {
  console.log(process.argv[1], process.argv[2], process.argv[3], process.argv[4])
  const attributes = {
    name: process.argv[2] || 'testing claim',
    author: process.argv[3] || 'the tester',
  }
  const client = new Client()
  const claim = await createClaim(PrivateKeyACD, ClaimType.Work, attributes)

  console.log(JSON.stringify(claim, null, 2))

  const response = await client.postWork(claim)

  console.log(JSON.stringify(await response.text(), null, 2))
}

main().catch(console.error)

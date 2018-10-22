/* tslint:disable:no-console */
import { createClaim, ClaimType } from '@po.et/poet-js'

import { PrivateKeyACD } from '../test/Claims'
import { Client } from '../test/Integration/Helper'

const main = async () => {
  const attributes = {
    name: process.argv[2] || 'testing claim',
    author: process.argv[3] || 'the tester',
  }
  const client = new Client()
  const claim = await createClaim(PrivateKeyACD, ClaimType.Work, attributes)

  console.log(JSON.stringify(claim, null, 2))

  const response = await client.postWork(claim)
}

main().catch(console.error)

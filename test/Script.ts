/* tslint:disable:no-console */
import { createClaim, ClaimType } from '@po.et/poet-js'

import { AStudyInScarlet, PrivateKeyEAP, PrivateKeyACD, TheMurdersInTheRueMorgue } from './Claims'

console.log(createClaim(PrivateKeyACD, ClaimType.Work, AStudyInScarlet.attributes))
console.log(createClaim(PrivateKeyEAP, ClaimType.Work, TheMurdersInTheRueMorgue.attributes))

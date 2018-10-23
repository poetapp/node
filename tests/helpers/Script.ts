/* tslint:disable:no-console */
import { configureCreateVerifiableClaim, getVerifiableClaimSigner } from '@po.et/poet-js'
import { pipeP } from 'ramda'

import {
  AStudyInScarlet,
  TheMurdersInTheRueMorgue,
  TheWeekOfDiana,
  KnowWhyTheCagedBirdSings,
  GatherTogetherInMyName,
  SinginAndSwinginAndGettingMerryLikeChristmas,
  TheHeartOfAWoman,
  AllGodsChildrenNeedTravelingShoes,
  ASongFlungUpToHeaven,
  MomAndMeAndMom,
  OnThePulseOfMorning,
  ABraveAndStartlingTruth,
} from './Claims'
import { issuerACD, issuerEAP, issuerMA, privateKeyACD, privateKeyEAP, privateKeyMA } from './Keys'

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()

const createACDWorkClaim = configureCreateVerifiableClaim({ issuer: issuerACD })
const createEAPWorkClaim = configureCreateVerifiableClaim({ issuer: issuerEAP })
const createMAWorkClaim = configureCreateVerifiableClaim({ issuer: issuerMA })

const signACDWorkClaim = configureSignVerifiableClaim({ privateKey: privateKeyACD })
const signEAPWorkClaim = configureSignVerifiableClaim({ privateKey: privateKeyEAP })
const signMAWorkClaim = configureSignVerifiableClaim({ privateKey: privateKeyMA })

const createACDClaim = pipeP(
  createACDWorkClaim,
  signACDWorkClaim
)
const createEAPClaim = pipeP(
  createEAPWorkClaim,
  signEAPWorkClaim
)
const createMAClaim = pipeP(
  createMAWorkClaim,
  signMAWorkClaim
)

const setUpClaims = async () => {
  console.log(await createACDClaim(AStudyInScarlet.claim))
  console.log(await createEAPClaim(TheMurdersInTheRueMorgue.claim))
  console.log(await createMAClaim(TheWeekOfDiana.claim))
  console.log(await createMAClaim(KnowWhyTheCagedBirdSings.claim))
  console.log(await createMAClaim(GatherTogetherInMyName.claim))
  console.log(await createMAClaim(SinginAndSwinginAndGettingMerryLikeChristmas.claim))
  console.log(await createMAClaim(TheHeartOfAWoman.claim))
  console.log(await createMAClaim(AllGodsChildrenNeedTravelingShoes.claim))
  console.log(await createMAClaim(ASongFlungUpToHeaven.claim))
  console.log(await createMAClaim(MomAndMeAndMom.claim))
  console.log(await createMAClaim(OnThePulseOfMorning.claim))
  console.log(await createMAClaim(ABraveAndStartlingTruth.claim))
}

setUpClaims().catch(console.error)

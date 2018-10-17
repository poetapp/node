/* tslint:disable:no-console */
/* tslint:disable:no-relative-imports */

import { configureCreateVerifiableClaim, getVerifiableClaimSigner } from '@po.et/poet-js'
import { pipeP } from 'ramda'

import {
  AStudyInScarlet,
  issuerACD,
  issuerEAP,
  issuerMA,
  TheMurdersInTheRueMorgue,
  TheRaven,
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
  PrivateKeyACD,
  PrivateKeyEAP,
  PrivateKeyMA,
} from './Claims'

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()

const createACDWorkClaim = configureCreateVerifiableClaim({ issuer: issuerACD })
const createEAPWorkClaim = configureCreateVerifiableClaim({ issuer: issuerEAP })
const createMAWorkClaim = configureCreateVerifiableClaim({ issuer: issuerMA })

const signACDWorkClaim = configureSignVerifiableClaim({ privateKey: PrivateKeyACD })
const signEAPWorkClaim = configureSignVerifiableClaim({ privateKey: PrivateKeyEAP })
const signMAWorkClaim = configureSignVerifiableClaim({ privateKey: PrivateKeyMA })

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
  console.log(await createEAPClaim(TheRaven.claim))
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

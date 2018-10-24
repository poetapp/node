/* tslint:disable:no-console */
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
import { createACDClaim, createEAPClaim, createMAClaim } from './utils'

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

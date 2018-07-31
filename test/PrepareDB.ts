/* tslint:disable:no-console */
import { Db, MongoClient } from 'mongodb'

import {
  AStudyInScarlet,
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
  ABraveAndStartlingTrugh,
} from './Claims'
import { waitForNode } from './Integration/Helper'

const collectionNames: ReadonlyArray<string> = ['works', 'blockchainReader', 'blockchainWriter', 'storage']
const MONGO_URL = process.env.INTEGRATION_TEST_MONGODB_URL || 'mongodb://localhost:27017/poet'

async function main() {
  console.log('Preparing DB for Integration Tests.')

  const mongoClient = await MongoClient.connect(MONGO_URL)
  const db = await mongoClient.db()

  console.log(`Cleaning collections ${collectionNames}...`)

  for (const collectionName of collectionNames) await emptyCollectionByName(db, collectionName)

  console.log('Inserting Works...')
  await insertTestWorks(db)

  await mongoClient.close()
  await waitForNode()

  console.log('DB Prepared for Integration Tests.')
}

async function emptyCollectionByName(db: Db, collectionName: string) {
  const collection = db.collection(collectionName)
  await collection.remove({})
}

async function insertTestWorks(db: Db) {
  const collection = db.collection('works')
  await collection.insertOne(TheRaven)
  await collection.insertOne(TheMurdersInTheRueMorgue)
  await collection.insertOne(AStudyInScarlet)
  await collection.insertOne(TheWeekOfDiana)
  await collection.insertOne(KnowWhyTheCagedBirdSings)
  await collection.insertOne(GatherTogetherInMyName)
  await collection.insertOne(SinginAndSwinginAndGettingMerryLikeChristmas)
  await collection.insertOne(TheHeartOfAWoman)
  await collection.insertOne(AllGodsChildrenNeedTravelingShoes)
  await collection.insertOne(ASongFlungUpToHeaven)
  await collection.insertOne(MomAndMeAndMom)
  await collection.insertOne(OnThePulseOfMorning)
  await collection.insertOne(ABraveAndStartlingTrugh)
}

main().catch(console.error)

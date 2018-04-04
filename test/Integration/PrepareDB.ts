import { MongoClient } from 'mongodb'

import { AStudyInScarlet, TheMurdersInTheRueMorgue, TheRaven } from '../Claims'
import { waitForNode } from './Helper'

async function main() {
  console.log('Preparing DB for Integration Tests.')
  const mongoClient = await MongoClient.connect('mongodb://localhost:27017/poet')
  const db = await mongoClient.db()
  const collection = db.collection('works')
  await collection.remove({})
  await collection.insertOne(TheRaven)
  await collection.insertOne(TheMurdersInTheRueMorgue)
  await collection.insertOne(AStudyInScarlet)
  await mongoClient.close()
  await waitForNode()
}

main().catch(console.error)

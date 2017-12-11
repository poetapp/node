import { MongoClient } from 'mongodb'

import { AStudyInScarlet, TheMurdersInTheRueMorgue, TheRaven } from '../Claims'

async function main() {
  console.log('Preparing DB for Integration Tests.')
  const db = await MongoClient.connect('mongodb://localhost:27017/poet')
  const collection = db.collection('works')
  await collection.remove({})
  await collection.insertOne(TheRaven)
  await collection.insertOne(TheMurdersInTheRueMorgue)
  await collection.insertOne(AStudyInScarlet)
  await db.close()
}

main().catch(console.error)

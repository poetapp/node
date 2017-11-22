import { Collection, Db, MongoClient } from 'mongodb'

import { TheRaven } from '../Claims'

async function main () {
  console.log('Preparing DB for Integration Tests.')
  const db = await MongoClient.connect('mongodb://localhost:27017/poet')
  const collection = db.collection('works')
  const result = await collection.insertOne(TheRaven)
  await db.close()
}

main().catch(console.error)

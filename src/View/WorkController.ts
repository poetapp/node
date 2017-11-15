import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'

import { Work } from 'Interfaces'

@injectable()
export class WorkController {
  private readonly db: Db
  private readonly collection: Collection

  constructor(
    @inject('DB') db: Db
  ) {
    this.db = db
    this.collection = this.db.collection('works')
  }

  createWork = (work: Work) => {
    console.log('Creating Work', work)
    const result = this.collection.insertOne(work)
  }
}

import { Collection, Db } from 'mongodb'

export class WorkController {
  private readonly db: Db
  private readonly collection: Collection

  constructor(db: Db) {
    this.db = db
    this.collection = this.db.collection('works')
  }

  getById(id: string): Promise<any> {
    console.log(`WorkController.getByid(${id})`)
    return this.collection.findOne({id})
  }

  create(work: any): Promise<any> {
    console.log(`WorkController.create(${JSON.stringify(work)})`)
    // TODO: move this to WorkDAO, verify id, publicKey & signature and send RMQ message here instead
    return this.collection.insertOne(work)
  }
}

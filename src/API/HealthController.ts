import { inject, injectable } from 'inversify'
import { Db } from 'mongodb'

import { IPFS } from './IPFS'

@injectable()
export class HealthController {
  private readonly db: Db
  private readonly ipfs: IPFS

  constructor(
    @inject('DB') db: Db,
    @inject('IPFS') ipfs: IPFS
  ) {
    this.db = db
    this.ipfs = ipfs
  }

  async getHealth(): Promise<any> {
    const mongoConnection = await this.db.stats()
    const mongoIsConnected = mongoConnection.ok === 1

    const ipfsConnection = await this.ipfs.checkHealth()
    const ipfsIsConnected = ipfsConnection === 200

    return {
      mongoIsConnected,
      ipfsIsConnected,
    }
  }
}

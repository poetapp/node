import { inject, injectable } from 'inversify'
import { Db } from 'mongodb'

import { IPFS } from './IPFS'

export const isOkOne = ({ ok }: { ok: number }) => ok === 1 
export const isStatus200 = ({ status }: { status: number }) => status === 200 

@injectable()
export class HealthController {
  private readonly db: Db
  private readonly ipfs: IPFS

  constructor(@inject('DB') db: Db, @inject('IPFS') ipfs: IPFS) {
    this.db = db
    this.ipfs = ipfs
  }

  async checkMongo(): Promise<any> {
    try {
      const mongoConnection = await this.db.stats()
      return isOkOne(mongoConnection)
    } catch (e) {
      return false
    }
  }

  async checkIPFS(): Promise<any> {
    try {
      const ipfsConnection = await this.ipfs.getVersion()
      return isStatus200(ipfsConnection)
    } catch (e) {
      return false
    }
  }
  async getHealth(): Promise<any> {
    const mongoIsConnected = await this.checkMongo()
    const ipfsIsConnected = await this.checkIPFS()

    return {
      mongoIsConnected,
      ipfsIsConnected,
    }
  }
}

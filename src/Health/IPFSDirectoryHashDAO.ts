import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'


export interface UpdateAnchorAttemptInfo {
  readonly ipfsDirectoryHash: string
  readonly txId: string
}

type updateAnchorAttemptsInfo = (x: UpdateAnchorAttemptInfo) => Promise<void>

@injectable()
export class IPFSDirectoryHashDAO {
  private readonly collection: Collection

  constructor(@inject('DB') db: Db) {
    this.collection = db.collection('ipfsDirectoryHashInfo')
  }

  readonly updateAnchorAttemptsInfo: updateAnchorAttemptsInfo = async anchorAttemptInfo => {
    await this.collection.updateOne(
      {
        ipfsDirectoryHash: anchorAttemptInfo.ipfsDirectoryHash,
        txId: { $ne: anchorAttemptInfo.txId },
      },
      {
        $set: { txId: anchorAttemptInfo.txId },
        $inc: { attempts: 1 },
        $setOnInsert: { attempts: 1 },
      },
      { upsert: true }
    )
  }
}

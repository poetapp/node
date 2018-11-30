import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface UpdateAnchorAttemptInfo {
  readonly ipfsDirectoryHash: string
  readonly txId: string
}

type updateAnchorAttemptsInfo = (x: UpdateAnchorAttemptInfo) => Promise<void>

@injectable()
export class IPFSDirectoryHashDAO {
  private readonly ipfsDirectoryHashInfoCollection: Collection

  constructor(
    @inject('IPFSDirectoryHashInfoCollection') ipfsDirectoryHashInfoCollection: Collection,
  ) {
    this.ipfsDirectoryHashInfoCollection = ipfsDirectoryHashInfoCollection
  }

  readonly updateAnchorAttemptsInfo: updateAnchorAttemptsInfo = async anchorAttemptInfo => {
    await this.ipfsDirectoryHashInfoCollection.updateOne(
      {
        ipfsDirectoryHash: anchorAttemptInfo.ipfsDirectoryHash,
        txId: { $ne: anchorAttemptInfo.txId },
      },
      {
        $set: { txId: anchorAttemptInfo.txId },
        $inc: { attempts: 1 },
        $setOnInsert: { attempts: 1 },
      },
      { upsert: true },
    )
  }
}

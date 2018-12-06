import { Collection } from 'mongodb'

export interface UpdateAnchorAttemptInfo {
  readonly ipfsDirectoryHash: string
  readonly txId: string
}

type updateAnchorAttemptsInfo = (x: UpdateAnchorAttemptInfo) => Promise<void>

export interface Dependencies {
  readonly ipfsDirectoryHashInfoCollection: Collection
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export class IPFSDirectoryHashDAO {
  private readonly ipfsDirectoryHashInfoCollection: Collection

  constructor({
    dependencies: {
      ipfsDirectoryHashInfoCollection,
    },
  }: Arguments) {
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

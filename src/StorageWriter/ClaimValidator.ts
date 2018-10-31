import { SignedVerifiableClaim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { asyncPipe } from 'Helpers/asyncPipe'

import { childWithFileName } from 'Helpers/Logging'

import { DAOClaims } from './DAOClaims'
import { IPFS } from './IPFS'

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

interface ValidateStoredClaimData {
  readonly ipfsFileHash: string,
  readonly ipfsClaim?: any 
  readonly dbClaim?: SignedVerifiableClaim 
}

@injectable()
export class ClaimValidator {
  private readonly logger: Pino.Logger
  private readonly daoClaims: DAOClaims
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DAOClaims') daoClaims: DAOClaims,
    @inject('IPFS') ipfs: IPFS,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.daoClaims = daoClaims
    this.ipfs = ipfs
  }

  private readonly log = (level: LogTypes) => (message: string) => async (value: any) => {
    const logger = this.logger
    logger[level]({ value }, message)
    return value
  }

  private loadDBClaim = async (x: ValidateStoredClaimData) => {
    const { ipfsFileHash } = x; 
    const dbClaim = await this.daoClaims.getClaimByHash(ipfsFileHash) 
    return {
      ...x,
      dbClaim 
    }
  }

  private downloadIPFSClaim = async (x: ValidateStoredClaimData) => {
    const { ipfsFileHash  } = x
    const ipfsClaim = await this.ipfs.cat(ipfsFileHash)
    return {
      ...x,
      ipfsFileHash
    }
  }

  private compareClaims = (x: ValidateStoredClaimData) => {
    const { ipfsClaim, dbClaim } = x
    if (ipfsClaim !== dbClaim) {
      
    }
  }

  public validateStoredClaim = asyncPipe(
    this.loadDBClaim,
    this.downloadIPFSClaim,
    this.compareClaims
  )
}

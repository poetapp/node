import { Claim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { pipeP } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'

import { DAOClaims } from './DAOClaims'
import { IPFS } from './IPFS'

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

interface StoreNextClaimData {
  readonly claim: Claim
  readonly ipfsFileHash?: string
}

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly daoClaims: DAOClaims
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DAOClaims') daoClaims: DAOClaims,
    @inject('IPFS') ipfs: IPFS
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

  public readonly create = async (claim: Claim): Promise<void> => {
    const logger = this.logger.child({ method: 'create' })

    logger.trace({ claim }, 'Adding Claim')

    await this.daoClaims.addClaim(claim)

    logger.trace({ claim }, 'Added Claim')
  }

  private readonly findNextClaim = async (): Promise<StoreNextClaimData> => {
    const claim = await this.daoClaims.findNextClaim()
    return { claim }
  }

  private readonly uploadClaim = (claim: Claim) => this.ipfs.addText(JSON.stringify(claim))

  private readonly storeClaim = async (data: StoreNextClaimData): Promise<StoreNextClaimData> => {
    const { claim } = data
    const ipfsFileHash = await this.uploadClaim(claim)
    return {
      ...data,
      ipfsFileHash,
    }
  }

  private readonly addIPFSHashToClaim = async (data: StoreNextClaimData): Promise<StoreNextClaimData> => {
    const { claim, ipfsFileHash } = data
    await this.daoClaims.addClaimHash(claim.id, ipfsFileHash)
    return data
  }

  public storeNextClaim = pipeP(
    this.log(LogTypes.trace)('Finding Claim'),
    this.findNextClaim,
    this.log(LogTypes.trace)('Storing Claim'),
    this.storeClaim,
    this.log(LogTypes.trace)('Adding IPFS hash to Claim Entry'),
    this.addIPFSHashToClaim,
    this.log(LogTypes.trace)('Finished Storing Claim')
  )
}

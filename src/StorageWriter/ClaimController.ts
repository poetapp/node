import { SignedVerifiableClaim } from '@po.et/poet-js'
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'
import { pipeP, equals } from 'ramda'

import { IPFS } from 'Helpers/IPFS'
import { childWithFileName } from 'Helpers/Logging'

import { DAOClaims } from './DAOClaims'
import { DAOIntegrityCheckFailures } from './DAOIntegrityCheckFailures'
import { IntegrityCheckFailure } from './Exceptions'

enum LogTypes {
  info = 'info',
  trace = 'trace',
  error = 'error',
}

interface StoreNextClaimData {
  readonly claim: SignedVerifiableClaim
  readonly ipfsFileHash?: string
}

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly daoClaims: DAOClaims
  private readonly daoIntegrityCheckFailures: DAOIntegrityCheckFailures
  private readonly ipfs: IPFS

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DAOClaims') daoClaims: DAOClaims,
    @inject('DAOIntegrityCheckFailures') daoIntegrityCheckFailures: DAOIntegrityCheckFailures,
    @inject('IPFS') ipfs: IPFS,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.daoClaims = daoClaims
    this.daoIntegrityCheckFailures = daoIntegrityCheckFailures
    this.ipfs = ipfs
  }

  private readonly log = (level: LogTypes) => (message: string) => async (value: any) => {
    const logger = this.logger
    logger[level]({ value }, message)
    return value
  }

  public readonly create = async (claim: SignedVerifiableClaim): Promise<void> => {
    const logger = this.logger.child({ method: 'create' })

    logger.trace({ claim }, 'Adding Claim')

    await this.daoClaims.addClaim(claim)

    logger.trace({ claim }, 'Added Claim')
  }

  private readonly findNextClaim = async (): Promise<StoreNextClaimData> => {
    const claim = await this.daoClaims.findNextClaim()
    return { claim }
  }

  private readonly downloadClaim = (ipfsFileHash: string) => this.ipfs.cat()(ipfsFileHash)

  private readonly integrityCheckFailure = async (
    claim: SignedVerifiableClaim,
    ipfsResult: string,
    message: string,
  ) => {
    await this.daoIntegrityCheckFailures.addFailure(claim, ipfsResult, message)
    throw new IntegrityCheckFailure(message)
  }

  private readonly integrityCheck = async (data: StoreNextClaimData) => {
    const { ipfsFileHash, claim } = data
    const ipfsResponse = await this.downloadClaim(ipfsFileHash)

    try {
      const claimFromIPFS = JSON.parse(ipfsResponse)
      if (!equals(claim, claimFromIPFS)) await this.integrityCheckFailure(claim, ipfsResponse, 'Claims do not match')
    } catch (error) {
      await this.integrityCheckFailure(claim, ipfsResponse, error.message)
    }

    return data
  }

  private readonly uploadClaim = (claim: SignedVerifiableClaim) => this.ipfs.addText()(JSON.stringify(claim))

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
    this.log(LogTypes.trace)('Checking integrity of stored claim'),
    this.integrityCheck,
    this.log(LogTypes.trace)('Adding IPFS hash to Claim Entry'),
    this.addIPFSHashToClaim,
    this.log(LogTypes.trace)('Finished Storing Claim'),
  )
}

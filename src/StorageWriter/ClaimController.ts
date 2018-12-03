import { SignedVerifiableClaim } from '@po.et/poet-js'
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

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly daoClaims: DAOClaims
  readonly daoIntegrityCheckFailures: DAOIntegrityCheckFailures
  readonly ipfs: IPFS
}

export interface Arguments {
  readonly dependencies: Dependencies
}

export interface ClaimController {
  readonly create: (claim: SignedVerifiableClaim) => Promise<void>
  readonly storeNextClaim: () => Promise<StoreNextClaimData>
}

export const ClaimController = ({
  dependencies: {
    logger,
    daoClaims,
    daoIntegrityCheckFailures,
    ipfs,
  },
}: Arguments): ClaimController => {
  const childLogger = childWithFileName(logger, __filename)

  const log = (level: LogTypes) => (message: string) => async (value: any) => {
    childLogger[level]({ value }, message)
    return value
  }

  const create = async (claim: SignedVerifiableClaim): Promise<void> => {
    const logger = childLogger.child({ method: 'create' })

    logger.trace({ claim }, 'Adding Claim')

    await daoClaims.addClaim(claim)

    logger.trace({ claim }, 'Added Claim')
  }

  const findNextClaim = async (): Promise<StoreNextClaimData> => {
    const claim = await daoClaims.findNextClaim()
    return { claim }
  }

  const downloadClaim = (ipfsFileHash: string) => ipfs.cat()(ipfsFileHash)

  const integrityCheckFailure = async (
    claim: SignedVerifiableClaim,
    ipfsResult: string,
    message: string,
  ) => {
    await daoIntegrityCheckFailures.addFailure(claim, ipfsResult, message)
    throw new IntegrityCheckFailure(message)
  }

  const integrityCheck = async (data: StoreNextClaimData) => {
    const { ipfsFileHash, claim } = data
    const ipfsResponse = await downloadClaim(ipfsFileHash)

    try {
      const claimFromIPFS = JSON.parse(ipfsResponse)
      if (!equals(claim, claimFromIPFS)) await integrityCheckFailure(claim, ipfsResponse, 'Claims do not match')
    } catch (error) {
      await integrityCheckFailure(claim, ipfsResponse, error.message)
    }

    return data
  }

  const uploadClaim = (claim: SignedVerifiableClaim) => ipfs.addText()(JSON.stringify(claim))

  const storeClaim = async (data: StoreNextClaimData): Promise<StoreNextClaimData> => {
    const { claim } = data
    const ipfsFileHash = await uploadClaim(claim)
    return {
      ...data,
      ipfsFileHash,
    }
  }

  const addIPFSHashToClaim = async (data: StoreNextClaimData): Promise<StoreNextClaimData> => {
    const { claim, ipfsFileHash } = data
    await daoClaims.addClaimHash(claim.id, ipfsFileHash)
    return data
  }

  const storeNextClaim = pipeP(
    log(LogTypes.trace)('Finding Claim'),
    findNextClaim,
    log(LogTypes.trace)('Storing Claim'),
    storeClaim,
    log(LogTypes.trace)('Checking integrity of stored claim'),
    integrityCheck,
    log(LogTypes.trace)('Adding IPFS hash to Claim Entry'),
    addIPFSHashToClaim,
    log(LogTypes.trace)('Finished Storing Claim'),
  )

  return {
    create,
    storeNextClaim,
  }
}

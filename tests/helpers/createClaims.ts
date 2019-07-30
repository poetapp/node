import { configureCreateVerifiableClaim, getVerifiableClaimSigner } from '@po.et/poet-js'
import { pipeP } from 'ramda'

import { issuerACD, issuerEAP, issuerMA, privateKeyACD, privateKeyEAP, privateKeyMA } from './Keys'

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()

const context = {
  about: 'schema:url',
}

const createACDWorkClaim = configureCreateVerifiableClaim({ issuer: issuerACD, context })
const createEAPWorkClaim = configureCreateVerifiableClaim({ issuer: issuerEAP })
const createMAWorkClaim = configureCreateVerifiableClaim({ issuer: issuerMA })

const signACDWorkClaim = configureSignVerifiableClaim({ privateKey: privateKeyACD })
const signEAPWorkClaim = configureSignVerifiableClaim({ privateKey: privateKeyEAP })
const signMAWorkClaim = configureSignVerifiableClaim({ privateKey: privateKeyMA })

export const createACDClaim = pipeP(
  createACDWorkClaim,
  signACDWorkClaim,
)
export const createEAPClaim = pipeP(
  createEAPWorkClaim,
  signEAPWorkClaim,
)
export const createMAClaim = pipeP(
  createMAWorkClaim,
  signMAWorkClaim,
)

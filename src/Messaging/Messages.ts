import { PoetBlockAnchor } from '@po.et/poet-js'
import * as Joi from 'joi'

export interface BlockDownloaded {
  readonly block: LightBlock
  readonly poetBlockAnchors: ReadonlyArray<PoetBlockAnchor>
}

export interface LightBlock {
  readonly hash: string
  readonly previousHash: string
  readonly height: number
}

export interface IPFSHashTxId {
  readonly ipfsDirectoryHash: string
  readonly txId: string
}

export interface ForkDetected {
  readonly blockHash: string
  readonly blockHeight: number
}

const PoetBlockAnchorJoiSchema = Joi.object({
  prefix: Joi.string().required(),
  version: Joi.number().required(),
  storageProtocol: Joi.number().required(),
  ipfsDirectoryHash: Joi.string().required(),
  transactionId: Joi.string().required(),
  blockHeight: Joi.number().required(),
  blockHash: Joi.string().required(),
})

const BlockDownloadedJoiSchema = Joi.object({
  block: Joi.object().required(),
  poetBlockAnchors: Joi.array()
    .items(PoetBlockAnchorJoiSchema)
    .optional(),
})

const IPFSHashTxIdJoiSchema = Joi.object({
  ipfsDirectoryHash: Joi.string().required(),
  txId: Joi.string().required(),
})

export const isBlockDownloaded = (messageContent: any): messageContent is BlockDownloaded =>
  Joi.validate(messageContent, BlockDownloadedJoiSchema).error === null

export const isIPFSHashTxId = (messageContent: any): messageContent is IPFSHashTxId =>
  Joi.validate(messageContent, IPFSHashTxIdJoiSchema).error === null

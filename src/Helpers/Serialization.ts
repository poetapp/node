/**
 * Helper file that takes care of serialization of Po.et Claims.
 * This file will be moved to poet-js in the future.
 */

import * as crypto from 'crypto'
import { Message } from 'protobufjs'

import { Claim, ClaimAttributes } from '../Interfaces'
import { ClaimProto, AttributeProto } from '../Serialization/PoetProto'

export namespace Serialization {

  export function protoToClaim(proto: any): Claim {
    const attributes: any = {}

    proto.attributes.forEach((attr: any) => {
      attributes[attr.key] = attr.value
    })

    return {
      id: proto.id.toString('hex'),
      publicKey: proto.publicKey.toString('hex'),
      signature: proto.signature.toString('hex'),
      type: proto.type,
      attributes
    }
  }

  export function claimToProto(claim: Claim): Message<any> {
    return ClaimProto.create({
      id: new Buffer(claim.id, 'hex'),
      publicKey: new Buffer(claim.publicKey, 'hex'),
      signature: new Buffer(claim.signature, 'hex'),
      dateCreated: claim.dateCreated.getTime(),
      type: claim.type,
      attributes: attributesToProtos(claim.attributes)
    })
  }

  export function claimToHex(claim: Claim) {
    return new Buffer(ClaimProto.encode(claimToProto(claim)).finish()).toString('hex')
  }

  export function serializedToClaim(claim: Buffer) {
    const decoded = ClaimProto.decode(claim)
    return protoToClaim(decoded)
  }

  function attributesToProtos(attributes: ClaimAttributes): ReadonlyArray<Message<any>> {
    const attributeArray = Object.entries(attributes).map(([key, value]) => ({key, value}))
    return attributeArray.map(AttributeProto.create, AttributeProto)
  }

  export function getClaimId(claim: Claim): string {
    const proto = claimToProto({
      ...claim,
      id: '',
      signature: ''
    })
    const buffer = ClaimProto.encode(proto).finish()
    const hash = crypto.createHash('sha256').update(buffer as any).digest().toString('hex')
    return hash
  }

}

import { Root, Type, INamespace } from 'protobufjs'

import * as PoetProto from './PoetProto.json'

const poetProtoRoot = Root.fromJSON(PoetProto as INamespace)

export const ClaimProto = poetProtoRoot.lookup('Poet.Claim') as Type
export const AttributeProto = poetProtoRoot.lookup('Poet.Attribute') as Type
